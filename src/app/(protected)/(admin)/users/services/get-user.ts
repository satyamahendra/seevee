"use server"

import {Prisma} from "@/generated/index"
import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {ServerResult} from "@/utils/types/server-action"
import {requirePermissions} from "@/utils/helpers/has-ability-server"

const selectUser = Prisma.validator<Prisma.UserSelect>()({
    id: true,
    name: true,
    email: true,
    image: true,
    createdAt: true,
    roles: {
        select: {role_name: true},
    },
    permissions: {
        select: {permission_name: true},
    },
})

type Response = Prisma.UserGetPayload<{select: typeof selectUser}>

export async function getUser(id: string): Promise<ServerResult<Response>> {
    try {
        const session = await authServer()

        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["read users", "manage users"])

        const user = await prisma.user.findUnique({
            where: {id: id},
            select: selectUser,
        })

        if (!user) throw new Error("User not found")

        return {success: true, data: user, message: "User fetched successfully"}
    } catch (error) {
        return handleServerError(error)
    }
}
