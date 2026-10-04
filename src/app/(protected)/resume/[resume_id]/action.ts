"use server"

import {Prisma} from "@/generated/index"
import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {ContentStateType} from "./_static/type"
import {revalidatePath} from "next/cache"

export async function getResumeById(id: string) {
    try {
        const session = await authServer()

        if (!session?.user) return {error: "Unauthorized!"}

        const resumeData = await prisma.resume.findFirst({where: {id, userId: session.user.id}})

        return {data: resumeData}
    } catch (error) {
        if (error instanceof Error) return {error: error.message}
        return {error: "Something went wrong..."}
    }
}

export async function updateResume(id: string, payload: ContentStateType[]) {
    try {
        const session = await authServer()

        if (!session?.user) return {error: "Unauthorized!"}

        const resumeData = await prisma.resume.updateMany({
            where: {id, userId: session.user.id},
            data: {data: payload as unknown as Prisma.InputJsonValue},
        })

        if (resumeData.count === 0) return {error: "Resume not found!"}

        revalidatePath(`/resume/${id}`)
        return {data: {id}}
    } catch (error) {
        if (error instanceof Error) return {error: error.message}
        return {error: "Something went wrong..."}
    }
}

export async function togglePublicResume(id: string) {
    try {
        const session = await authServer()

        if (!session?.user) return {error: "Unauthorized!"}

        const thisResume = await prisma.resume.findFirst({where: {id, userId: session.user.id}})

        if (!thisResume) return {error: "Resume not found!"}

        const updatedResume = await prisma.resume.update({
            where: {id},
            data: {isPublic: !thisResume.isPublic},
        })

        revalidatePath(`/resume/${id}`)
        return {data: updatedResume}
    } catch (error) {
        if (error instanceof Error) return {error: error.message}
        return {error: "Something went wrong..."}
    }
}