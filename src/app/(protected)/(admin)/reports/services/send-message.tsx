"use server"

import prisma from "@/lib/prisma/client"
import {revalidatePath} from "next/cache"
import {ServerResult} from "@/utils/types/server-action"
import {authServer} from "@/lib/auth-server"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {requirePermissions} from "@/utils/helpers/has-ability-server"
import {MessageFormSchema, messageSchema} from "../utils/schema"
import {ReportMessage} from "@/generated/index"

export async function sendMessage(data: MessageFormSchema): Promise<ServerResult<ReportMessage>> {
    const parsed = messageSchema.safeParse(data)

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

        const report = await prisma.reportMessage.create({
            data: {
                report_id: data.report_id,
                message: data.message,
                sender_id: session.user.id,
            },
        })

        revalidatePath(`/reports?detail=${data.report_id}`)
        return {success: true, data: report, message: `Message sent successfully`}
    } catch (error) {
        return handleServerError(error)
    }
}
