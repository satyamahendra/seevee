"use server"

import {Prisma} from "@/generated/index"
import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {requirePermissions} from "@/utils/helpers/has-ability-server"
import {uuidToShort} from "@/utils/helpers/shortenResumeID"
import {ServerResult} from "@/utils/types/server-action"

// `data` (the resume blocks) is skipped on purpose: it's the heavy column and the list doesn't need it.
const resumeSelect = Prisma.validator<Prisma.ResumeSelect>()({id: true, isPublic: true, createdAt: true, updatedAt: true})

export type UserResume = Prisma.ResumeGetPayload<{select: typeof resumeSelect}> & {short_id: string}

export async function getUserResumes(userId: string): Promise<ServerResult<UserResume[]>> {
    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["read users", "manage users"])

        const resumes = await prisma.resume.findMany({where: {userId}, orderBy: {updatedAt: "desc"}, select: resumeSelect})

        return {success: true, data: resumes.map((r) => ({...r, short_id: uuidToShort(r.id)})), message: "Resumes fetched successfully"}
    } catch (error) {
        return handleServerError(error)
    }
}
