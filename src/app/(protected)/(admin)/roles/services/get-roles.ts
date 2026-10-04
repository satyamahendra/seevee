"use server"

import prisma from "@/lib/prisma/client"
import {Prisma} from "@/generated/index"
import {authServer} from "@/lib/auth-server"
import {Pagination} from "@/utils/types/pagination"
import {PAGE_SIZE} from "@/utils/constants/pagination"
import {requirePermissions} from "@/utils/helpers/has-ability-server"

const roleSelect = Prisma.validator<Prisma.RoleSelect>()({
    name: true,
    is_active: true,
    permissions: {
        select: {permission_name: true},
    },
})

export type GetRole = Prisma.RoleGetPayload<{select: typeof roleSelect}>

export type GetRoles = {
    roles: GetRole[]
    pagination: Pagination
}

export const getRoles = async (page: number = 1, search = ""): Promise<GetRoles> => {
    const skip = (page - 1) * PAGE_SIZE

    const session = await authServer()

    if (!session) throw new Error("Unauthorized")
    await requirePermissions(["read roles", "manage roles"])

    const where: Prisma.RoleWhereInput = search ? {name: {contains: search, mode: "insensitive"}} : {}

    const [roles, total] = await Promise.all([
        prisma.role.findMany({
            skip,
            take: PAGE_SIZE,
            orderBy: {name: "asc"},
            select: roleSelect,
            where,
        }),
        prisma.role.count({
            where,
        }),
    ])

    return {
        roles,
        pagination: {
            page,
            total,
            pageCount: Math.ceil(total / PAGE_SIZE),
        },
    }
}
