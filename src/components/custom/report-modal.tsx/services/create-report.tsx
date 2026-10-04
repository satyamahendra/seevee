"use server"

import {authServer} from "@/lib/auth-server"
import {ReportModalSchema} from "../utils/schema"
import {ServerResult} from "@/utils/types/server-action"
import {Report} from "@/generated/index"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import prisma from "@/lib/prisma/client"
import {revalidatePath} from "next/cache"

export const createReport = async (data: ReportModalSchema): Promise<ServerResult<Report>> => {
    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")

        const report = await prisma.report.create({
            data: {
                title: data.title,
                description: data.description,
                user_id: session.user.id,
                type: data.type,
                status: "open",
                order_id: data.order_id,
            },
        })

        revalidatePath("/reports")
        return {
            success: true,
            data: report,
            message: "Report created successfully",
        }
    } catch (error) {
        return handleServerError(error)
    }
}
