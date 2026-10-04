"use server"

import {Role} from "@/generated/index"
import prisma from "@/lib/prisma/client"
import {ServerResult} from "@/utils/types/server-action"
import {authServer} from "@/lib/auth-server"
import {handleServerError} from "../helpers/handle-server-errors"
import {requirePermissions} from "../helpers/has-ability-server"

export async function getRoles(): Promise<ServerResult<Role[]>> {
    try {
        const session = await authServer()

        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["read users", "manage users"])

        const roles = await prisma.role.findMany({
            select: {name: true},
        })

        if (!roles) throw new Error("Roles not found")

        return {success: true, data: roles as Role[], message: "Roles fetched successfully"}
    } catch (error) {
        return handleServerError(error)
    }
}
