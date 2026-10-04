"use server"

import prisma from "@/lib/prisma/client"
import {revalidatePath} from "next/cache"
import {ServerResult} from "@/utils/types/server-action"
import {Role} from "@/generated/index"
import {authServer} from "@/lib/auth-server"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {requirePermissions} from "@/utils/helpers/has-ability-server"

export async function deleteRole(roleName: string): Promise<ServerResult<Role>> {
    try {
        const session = await authServer()

        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["delete roles", "manage roles"])

        const role = (await prisma.role.delete({
            where: {name: roleName},
            select: {name: true},
        })) as Role

        revalidatePath("/roles")
        return {success: true, data: role, message: `Role deleted successfully`}
    } catch (error) {
        return handleServerError(error)
    }
}
