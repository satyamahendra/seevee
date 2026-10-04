"use server"

import {Prisma} from "@/generated/index"
import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {ServerResult} from "@/utils/types/server-action"
import {requirePermissions} from "@/utils/helpers/has-ability-server"

const reportSelect = Prisma.validator<Prisma.ReportSelect>()({
    id: true,
    created_at: true,
    type: true,
    updated_at: true,
    title: true,
    description: true,
    order_id: true,
    resolved_at: true,
    status: true,
    _count: {
        select: {
            messages: true,
        },
    },
    user: {
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        },
    },
    messages: {
        select: {
            id: true,
            message: true,
            read_at: true,
            created_at: true,
            sender: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    },
})

export type GetReport = Prisma.ReportGetPayload<{select: typeof reportSelect}>

export async function getReport(id: string): Promise<ServerResult<GetReport>> {
    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["read reports", "manage reports"])

        const report = await prisma.report.findUnique({
            select: reportSelect,
            where: {
                id: id,
            },
        })

        if (!report) throw new Error("Report not found")

        return {success: true, data: report, message: "Report fetched successfully"}
    } catch (error) {
        return handleServerError(error)
    }
}
