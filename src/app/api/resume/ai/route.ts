import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {dummyResumeData} from "@/app/(protected)/resume/[resume_id]/_static/var"
import {gemini} from "@/lib/gemini/gemini"
import {generatePrompt} from "@/util/helpers/generatePrompt"

export async function POST(request: Request) {
    const session = await authServer()
    if (!session?.user) return Response.json({error: "Unauthorized!"}, {status: 401})

    const {payload, userPrompt, resumeId} = await request.json()

    const currentUserCredits = await prisma.userCredit.findUnique({where: {userId: session.user.id}})

    if ((currentUserCredits?.totalCredits ?? 0) < 1)
        return Response.json({error: "You don't have enough credits to use the AI Assist!"}, {status: 402})

    const prompt = generatePrompt(JSON.stringify(payload), JSON.stringify(userPrompt), JSON.stringify(dummyResumeData))

    try {
        const result = await gemini.generateContentStream({
            contents: [{role: "user", parts: [{text: prompt}]}],
        })

        const encoder = new TextEncoder()
        let fullText = ""
        let isFirstChunk = true

        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of result.stream) {
                    let text = chunk.text().replace(/```json|```/g, "")

                    if (isFirstChunk && text.startsWith("json")) {
                        text = text.replace(/^json\s*/, "")
                        isFirstChunk = false
                    }

                    fullText += text
                    controller.enqueue(encoder.encode(text))
                }

                controller.close()

                // Transaction after full stream is done
                try {
                    const parsedResume = JSON.parse(fullText)

                    await prisma.$transaction(async (tx) => {
                        const credits = await tx.userCredit.findUnique({where: {userId: session.user.id}})

                        await tx.userCredit.update({
                            where: {userId: session.user.id},
                            data: {totalCredits: Math.max((credits?.totalCredits ?? 0) - 1, 0)},
                        })

                        await tx.resume.updateMany({
                            where: {id: resumeId, userId: session.user.id},
                            data: {data: parsedResume},
                        })

                        await tx.creditTransaction.create({
                            data: {
                                userId: session.user.id,
                                creditsUsed: 1,
                                actionType: "AI Assist",
                                result: parsedResume,
                            },
                        })
                    })
                } catch (e) {
                    console.error("Failed to parse or commit transaction:", e)
                }
            },
        })

        return new Response(stream, {
            headers: {"Content-Type": "text/plain"},
        })
    } catch (error) {
        if (error instanceof Error) return Response.json({error: error.message}, {status: 500})
        return Response.json({error: "Something went wrong..."}, {status: 500})
    }
}