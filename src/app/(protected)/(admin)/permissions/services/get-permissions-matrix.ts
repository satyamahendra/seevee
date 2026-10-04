"use server"

import prisma from "@/lib/prisma/client"
import {authServer} from "@/lib/auth-server"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {ServerResult} from "@/utils/types/server-action"
import {requirePermissions} from "@/utils/helpers/has-ability-server"

export type MatrixRole = {
    name: string
    is_active: boolean
    permission_names: string[]
}

export type PermissionsMatrix = {
    permission_names: string[]
    permissions: {name: string; is_active: boolean}[]
    roles: MatrixRole[]
}

export async function getPermissionsMatrix(): Promise<ServerResult<PermissionsMatrix>> {
    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["read permissions", "manage permissions"])

        const [permissions, roles] = await Promise.all([
            prisma.permission.findMany({select: {name: true, is_active: true}, orderBy: {name: "asc"}}),
            prisma.role.findMany({
                select: {
                    name: true,
                    is_active: true,
                    permissions: {select: {permission_name: true}},
                },
                orderBy: {name: "asc"},
            }),
        ])

        return {
            success: true,
            data: {
                permission_names: permissions.map((p) => p.name),
                permissions: permissions.map((p) => ({name: p.name, is_active: p.is_active})),
                roles: roles.map((r) => ({
                    name: r.name,
                    is_active: r.is_active,
                    permission_names: r.permissions.map((p) => p.permission_name),
                })),
            },
            message: "Matrix fetched successfully",
        }
    } catch (error) {
        return handleServerError(error)
    }
}
