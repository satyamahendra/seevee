"use server"

import prisma from "@/lib/prisma/client"
import {ServerResult} from "@/utils/types/server-action"
import {authServer} from "@/lib/auth-server"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {requirePermissions} from "@/utils/helpers/has-ability-server"
import {revalidatePath} from "next/cache"

export async function updateRolePermissions(roleName: string, permissions: string[]): Promise<ServerResult<null>> {
    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["manage roles"])

        await prisma.$transaction(async (tx) => {
            await tx.rolePermission.deleteMany({where: {role_name: roleName}})
            if (permissions.length > 0) {
                await tx.rolePermission.createMany({
                    data: permissions.map((permission_name) => ({role_name: roleName, permission_name})),
                    skipDuplicates: true,
                })
            }
        })

        revalidatePath("/roles")
        return {success: true, data: null, message: "Role permissions updated"}
    } catch (error) {
        return handleServerError(error)
    }
}
