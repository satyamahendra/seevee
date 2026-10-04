"use server"

import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"

export const getUserCredits = async () => {
    try {
        const session = await authServer()

        if (!session?.user) return {error: "Unauthorized"}

        const credits = await prisma.userCredit.findUnique({where: {userId: session.user.id}})

        return {data: {totalCredits: credits?.totalCredits ?? 0}}
    } catch (error) {
        if (error instanceof Error) return {error: error.message}
        return {error: "Something went wrong..."}
    }
}