"use server"

import {Permission, Role} from "@/generated/index"
import prisma from "@/lib/prisma/client"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {requirePermissions} from "@/utils/helpers/has-ability-server"
import {ServerResult} from "@/utils/types/server-action"

export async function getPermissionsAndRoles(): Promise<ServerResult<{permissions: Permission[]; roles: Role[]}>> {
    try {
        await requirePermissions(["read users", "manage users"])
        const permissions = await prisma.permission.findMany({
            select: {name: true, is_active: true},
        })

        const roles = await prisma.role.findMany({
            select: {name: true, is_active: true},
        })

        return {success: true, data: {permissions, roles}, message: "Permissions and roles fetched successfully"}
    } catch (error) {
        return handleServerError(error)
    }
}
