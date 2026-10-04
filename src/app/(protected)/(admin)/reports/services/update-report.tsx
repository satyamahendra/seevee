"use server"

import prisma from "@/lib/prisma/client"
import {revalidatePath} from "next/cache"
import {ServerResult} from "@/utils/types/server-action"
import {authServer} from "@/lib/auth-server"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {requirePermissions} from "@/utils/helpers/has-ability-server"
import {ReportFormSchema, reportSchema} from "../utils/schema"
import {Report} from "@/generated/index"

export async function updateReport(data: ReportFormSchema): Promise<ServerResult<Report>> {
    const parsed = reportSchema.safeParse(data)

    if (!parsed.success) {
        return {
            success: false,
            data: null,
            message: "Invalid data",
            errors: parsed.error.flatten<string>((issue) => issue.message).fieldErrors,
        }
    }

    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["update reports", "manage reports"])

        const report = await prisma.report.update({
            where: {
                id: data.id,
            },
            data: {
                status: data.status,
                resolved_at: data.resolved_at,
            },
        })

        revalidatePath(`/reports?detail=${data.id}`)
        return {success: true, data: report, message: `Message sent successfully`}
    } catch (error) {
        return handleServerError(error)
    }
}
