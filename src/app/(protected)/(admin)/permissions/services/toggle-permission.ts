"use server"

import prisma from "@/lib/prisma/client"
import {authServer} from "@/lib/auth-server"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {requirePermissions} from "@/utils/helpers/has-ability-server"
import {ServerResult} from "@/utils/types/server-action"
import {revalidatePath} from "next/cache"

export async function togglePermission(name: string, isActive: boolean): Promise<ServerResult<null>> {
    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["manage permissions"])

        await prisma.permission.update({
            where: {name},
            data: {is_active: isActive},
        })

        revalidatePath("/permissions")
        return {success: true, data: null, message: isActive ? "Permission enabled" : "Permission disabled"}
    } catch (error) {
        return handleServerError(error)
    }
}
