import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {gemini, geminiModel} from "@/lib/gemini/gemini"
import {generatePrompt} from "@/util/helpers/generatePrompt"
import {aiRequestSchema, resumeSchema} from "@/lib/gemini/resume-schema"

export async function POST(request: Request) {
    const session = await authServer()
    if (!session?.user) return Response.json({error: "Unauthorized"}, {status: 401})

    let input: unknown
    try {
        input = await request.json()
    } catch {
        return Response.json({error: "Invalid JSON request"}, {status: 400})
    }

    const parsedInput = aiRequestSchema.safeParse(input)
    if (!parsedInput.success) {
        console.error("Invalid resume AI request", parsedInput.error.issues.map((issue) => issue.path.join(".")).join(", "))
        return Response.json({error: "Invalid resume request"}, {status: 400})
    }

    const {payload, userPrompt, resumeId} = parsedInput.data
    const currentUserCredits = await prisma.userCredit.findUnique({where: {userId: session.user.id}})
    if ((currentUserCredits?.totalCredits ?? 0) < 1) {
        return Response.json({error: "You don't have enough credits to use the AI Assist!"}, {status: 402})
    }

    const prompt = generatePrompt(JSON.stringify(payload), JSON.stringify(userPrompt), "The response must be a JSON array matching the supplied resume structure.")

    try {
        const result = await gemini.models.generateContentStream({
            model: geminiModel,
            contents: prompt,
            config: {responseMimeType: "application/json"},
        })

        const encoder = new TextEncoder()
        let fullText = ""
        let isFirstChunk = true

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result) {
                        let text = chunk.text ?? ""
                        if (isFirstChunk) {
                            text = text.replace(/^```json\s*/, "")
                            isFirstChunk = false
                        }
                        text = text.replace(/```\s*$/, "")
                        fullText += text
                        controller.enqueue(encoder.encode(text))
                    }

                    const parsedResume = resumeSchema.parse(JSON.parse(fullText))
                    await prisma.$transaction(async (tx) => {
                        const update = await tx.resume.updateMany({
                            where: {id: resumeId, userId: session.user.id},
                            data: {data: parsedResume},
                        })
                        if (update.count !== 1) throw new Error("Resume not found")

                        const credits = await tx.userCredit.updateMany({
                            where: {userId: session.user.id, totalCredits: {gte: 1}},
                            data: {totalCredits: {decrement: 1}},
                        })
                        if (credits.count !== 1) throw new Error("Insufficient credits")

                        await tx.creditTransaction.create({
                            data: {userId: session.user.id, creditsUsed: 1, actionType: "AI Assist", result: parsedResume},
                        })
                    })
                    controller.close()
                } catch (error) {
                    console.error("AI resume generation failed", error instanceof Error ? error.message : "unknown error")
                    controller.error(new Error("Resume generation failed"))
                }
            },
        })

        return new Response(stream, {headers: {"Content-Type": "application/json; charset=utf-8"}})
    } catch (error) {
        console.error("Gemini request failed", error instanceof Error ? error.message : "unknown error")
        return Response.json({error: "Resume generation is temporarily unavailable"}, {status: 502})
    }
}
