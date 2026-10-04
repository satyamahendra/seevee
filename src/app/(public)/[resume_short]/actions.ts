"use server"

import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {shortToUuid} from "@/util/helpers/shortenResumeID"

export async function getResumeByHash(resume_short: string) {
    try {
        const session = await authServer()

        const resumeId = shortToUuid(resume_short)

        const resume = await prisma.resume.findUnique({where: {id: resumeId}})

        if (!resume) throw new Error("Resume not found")

        if (resume.isPublic || resume.userId === session?.user?.id) return {data: resume}

        throw new Error("Resume is not public")
    } catch (error) {
        if (error instanceof Error) throw new Error(error.message)
        throw new Error("Something went wrong...")
    }
}