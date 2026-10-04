"use server"

import {Prisma} from "@/generated/index"
import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {PAGE_SIZE} from "@/utils/constants/pagination"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {Pagination} from "@/utils/types/pagination"
import {ServerResult} from "@/utils/types/server-action"
import {requirePermissions} from "@/utils/helpers/has-ability-server"

const reportSelect = Prisma.validator<Prisma.ReportSelect>()({
    id: true,
    created_at: true,
    title: true,
    type: true,
    status: true,
    user: {
        select: {
            id: true,
            image: true,
            name: true,
            email: true,
        },
    },
    _count: {
        select: {
            messages: true,
        },
    },
})

export type GetReport = Prisma.ReportGetPayload<{select: typeof reportSelect}>

export type GetReports = {
    reports: GetReport[]
    pagination: Pagination
}

export async function getReports(page: number = 1, search = ""): Promise<ServerResult<GetReports>> {
    const skip = (page - 1) * PAGE_SIZE

    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["read reports", "manage reports"])

        const where: Prisma.ReportWhereInput = search
            ? {
                  OR: [
                      {user: {name: {contains: search, mode: "insensitive"}}},
                      {user: {email: {contains: search, mode: "insensitive"}}},
                      {title: {contains: search, mode: "insensitive"}},
                      {description: {contains: search, mode: "insensitive"}},
                  ],
              }
            : {}

        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                skip,
                take: PAGE_SIZE,
                orderBy: {created_at: "desc"},
                select: reportSelect,
                where,
            }),
            prisma.report.count({
                where,
            }),
        ])

        return {
            success: true,
            message: "Reports fetched successfully",
            data: {
                reports,
                pagination: {
                    page,
                    total,
                    pageCount: Math.ceil(total / PAGE_SIZE),
                },
            },
        }
    } catch (error) {
        return handleServerError(error)
    }
}
