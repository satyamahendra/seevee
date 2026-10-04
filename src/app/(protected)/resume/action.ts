"use server"

import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {revalidatePath} from "next/cache"

export type ResumeRow = {
    id: string
    userId: string
    data: unknown
    isPublic: boolean
    createdAt: Date
    updatedAt: Date
}

export async function getResume() {
    try {
        const session = await authServer()

        if (!session?.user) return {error: "Unauthorized"}

        const resumesData = await prisma.resume.findMany({
            where: {userId: session.user.id},
            orderBy: {createdAt: "desc"},
        })

        return {data: resumesData}
    } catch (error) {
        if (error instanceof Error) return {error: error.message}
        return {error: "Something went wrong..."}
    }
}

export async function createResume() {
    try {
        const session = await authServer()

        if (!session) return {error: "Unauthorized"}

        const resumeData = await prisma.resume.create({
            data: {userId: session.user.id, data: []},
            select: {id: true},
        })

        return {data: resumeData}
    } catch (error) {
        console.error("Error creating resume:", error)
        return {error: "Something went wrong..."}
    }
}

export async function deleteResume(id: string) {
    try {
        const session = await authServer()

        if (!session?.user) return {error: "Unauthorized"}

        const deletedResume = await prisma.resume.deleteMany({
            where: {id, userId: session.user.id},
        })

        if (deletedResume.count === 0) return {error: "Resume not found or unauthorized!"}

        revalidatePath("/resume")
        return {data: {id}}
    } catch (error) {
        if (error instanceof Error) return {error: error.message}
        return {error: "Something went wrong..."}
    }
}