"use server"

import prisma from "@/lib/prisma/client"
import {revalidatePath} from "next/cache"
import {ServerResult} from "@/utils/types/server-action"
import {authServer} from "@/lib/auth-server"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {requirePermissions} from "@/utils/helpers/has-ability-server"

export async function deletePermission(name: string): Promise<ServerResult<null>> {
    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["delete permissions", "manage permissions"])

        await prisma.permission.delete({where: {name}})

        revalidatePath("/permissions")
        return {success: true, data: null, message: `Permission "${name}" deleted`}
    } catch (error) {
        return handleServerError(error)
    }
}
