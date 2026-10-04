"use server"

import {Prisma} from "@/generated/index"
import prisma from "@/lib/prisma/client"
import {PAGE_SIZE} from "@/utils/constants/pagination"
import {Pagination} from "@/utils/types/pagination"
import {requirePermissions} from "@/utils/helpers/has-ability-server"

const userSelect = Prisma.validator<Prisma.UserSelect>()({
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

export type User = Prisma.UserGetPayload<{select: typeof userSelect}>

export type UsersPage = {
    users: User[]
    pagination: Pagination
}

export async function getUsers(page: number = 1, search = ""): Promise<UsersPage> {
    await requirePermissions(["read users", "manage users"])

    const skip = (page - 1) * PAGE_SIZE

    const where = search && {
        OR: [
            {
                name: {
                    contains: search,
                },
            },
            {
                email: {
                    contains: search,
                },
            },
        ],
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            skip,
            take: PAGE_SIZE,
            orderBy: {createdAt: "desc"},
            select: userSelect,
            ...(where && {where}),
        }),
        prisma.user.count(),
    ])

    return {
        users,
        pagination: {
            page,
            total,
            pageCount: Math.ceil(total / PAGE_SIZE),
        },
    }
}
