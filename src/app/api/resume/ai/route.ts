import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {getGemini, geminiModel} from "@/lib/gemini/gemini"
import {ThinkingLevel} from "@google/genai"
import {buildAiTailorPrompt} from "@/utils/helpers/generatePrompt"
import {pdfToText} from "@/utils/helpers/pdfToText"
import {AI_LIMITS, aiOutputJsonSchema, aiOutputSchema, aiRequestSchema, resumeSchema} from "@/lib/gemini/resume-schema"
import {hasResumeContent} from "@/app/(protected)/resume/[resume_id]/_static/ai-schema"
import {uniqueResumeIds} from "@/utils/helpers/uniqueResumeIds"
import {apiError} from "@/utils/types/api-routes"
import {handleServerError} from "@/utils/helpers/handle-server-errors"

const encoder = new TextEncoder()
const MAX_ATTEMPTS = 3
class MaxTokensError extends Error {}

// Response is NDJSON: `{"delta": "..."}` lines while the model writes, then exactly one ServerResult line.
// Errors go out as that last line instead of erroring the stream, so the client always gets a real message.
export async function POST(request: Request) {
    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")
        const userId = session.user.id

        const {payload, request: aiRequest = "", focus = [], resumeId, file} = aiRequestSchema.parse(await request.json())
        const payloadJson = JSON.stringify(payload)
        if (payloadJson.length > 400_000) throw new Error("Resume data is too large to process")

        // Extract text here - far cheaper than shipping the raw file to Gemini. Capped so a bloated PDF cannot inflate the bill.
        const pdfText = file?.base64 ? (await pdfToText(file.base64)).slice(0, AI_LIMITS.pdfText) : ""
        // A blank resume is filled from the PDF or written from the request, so it may gain sections; edits keep the block count.
        const current = resumeSchema.safeParse(payload)
        const isBlank = payload.length === 0 || (current.success && !hasResumeContent(current.data))
        // Focus areas alone can't build a resume (also catches a scanned PDF with no extractable text).
        if (isBlank && !aiRequest && !pdfText) throw new Error("This resume is empty. Describe the resume you want, or upload a text-based PDF.")
        const {system, contents} = buildAiTailorPrompt({payload: payloadJson, request: aiRequest, focus, pdfText, today: new Date().toISOString().slice(0, 10), isBlank})

        // Reserve the credit before paying for Gemini, so parallel requests can't share one credit.
        const reserved = await prisma.userCredit.updateMany({where: {userId, totalCredits: {gte: 1}}, data: {totalCredits: {decrement: 1}}})
        if (reserved.count !== 1) throw new Error("You don't have enough credits to use the AI Assist!")

        const stream = new ReadableStream({
            async start(controller) {
                const send = (message: object) => {
                    try {
                        controller.enqueue(encoder.encode(JSON.stringify(message) + "\n"))
                    } catch {
                        // Client disconnected: keep going so the result is still saved.
                    }
                }
                let fullText = ""
                let streamed = false
                let firstTokenTimer: ReturnType<typeof setTimeout> | undefined

                // The SDK only retries the initial request; a stream that breaks mid-way (it reports "Incomplete JSON
                // segment at the end") or a bad/invalid output is retried here as a whole new generation.
                const generate = async () => {
                    fullText = ""
                    streamed = false
                    // No first token within 45s (SDK retries included) means the model is stuck; fail fast instead of hanging.
                    const abort = new AbortController()
                    firstTokenTimer = setTimeout(() => abort.abort(), 45_000)
                    const chunks = await getGemini().models.generateContentStream({
                        model: geminiModel,
                        contents,
                        config: {
                            abortSignal: abort.signal,
                            responseMimeType: "application/json",
                            responseJsonSchema: aiOutputJsonSchema,
                            systemInstruction: system,
                            // Thinking tokens count against maxOutputTokens and delay the first byte; HIGH truncated the JSON.
                            thinkingConfig: {thinkingLevel: ThinkingLevel.LOW},
                            // ~2x the largest real run (≈5k JSON + ≈3k thinking); caps the worst-case bill.
                            maxOutputTokens: 16384,
                        },
                    })

                    let finishReason: string | undefined
                    for await (const chunk of chunks) {
                        clearTimeout(firstTokenTimer)
                        finishReason = chunk.candidates?.[0]?.finishReason ?? finishReason
                        const delta = chunk.text ?? ""
                        fullText += delta
                        if (delta) send({delta})
                    }
                    streamed = true

                    // A truncated response is not the full resume - fail instead of saving and charging for it.
                    if (finishReason === "MAX_TOKENS") throw new MaxTokensError("The AI response was cut off. Please try a shorter request.")

                    // Structured output guarantees JSON; zod is still the trust boundary.
                    const output = aiOutputSchema.parse(JSON.parse(fullText))
                    const resume = uniqueResumeIds(output.resume)
                    if (resume.length === 0) throw new Error("The AI returned an empty resume")
                    // A model that drops a block would silently delete the user's data, so fail instead.
                    if (!isBlank && resume.length !== payload.length) throw new Error("The AI changed the number of resume sections")
                    return {output, resume}
                }

                try {
                    let result: Awaited<ReturnType<typeof generate>> | undefined
                    for (let attempt = 1; !result; attempt++) {
                        try {
                            result = await generate()
                        } catch (error) {
                            clearTimeout(firstTokenTimer)
                            // MAX_TOKENS repeats on every try, so retrying only multiplies the bill.
                            if (attempt >= MAX_ATTEMPTS || error instanceof MaxTokensError) throw error
                            console.error(`AI attempt ${attempt} failed, retrying:`, error instanceof Error ? error.message : error, "| snippet:", fullText.slice(0, 300))
                            send({reset: true})
                        }
                    }
                    const {output, resume} = result

                    await prisma.$transaction(async (tx) => {
                        const update = await tx.resume.updateMany({where: {id: resumeId, userId}, data: {data: resume}})
                        if (update.count !== 1) throw new Error("Resume not found")
                        await tx.creditTransaction.create({data: {userId, creditsUsed: 1, actionType: "AI Assist", result: resume}})
                    })
                    send({success: true, data: {...output, resume}, message: "Resume updated. Review the changes."})
                } catch (error) {
                    console.error("AI resume generation failed:", error instanceof Error ? error.message : error, "| snippet:", fullText.slice(0, 300))
                    await prisma.userCredit
                        .updateMany({where: {userId}, data: {totalCredits: {increment: 1}}})
                        .catch(() => console.error("AI credit refund failed", userId))
                    // Before the stream finished, errors are Gemini's: 429/503, our 45s abort, or a 503 sent mid-stream that the
                    // SDK misreports as "Incomplete JSON segment at the end". Their raw messages mean nothing to users.
                    const safe = streamed ? error : new Error("The AI is busy right now. Your credit was refunded, please try again in a minute.")
                    send(handleServerError(safe))
                } finally {
                    clearTimeout(firstTokenTimer)
                    try {
                        controller.close()
                    } catch {}
                }
            },
        })

        // no-transform/X-Accel-Buffering stop compression and proxies from buffering the stream.
        return new Response(stream, {
            headers: {"Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no"},
        })
    } catch (error) {
        return apiError(error)
    }
}
