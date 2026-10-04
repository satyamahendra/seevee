"use server"

import {Prisma} from "@/generated/index"
import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {ServerResult} from "@/utils/types/server-action"
import {requirePermissions} from "@/utils/helpers/has-ability-server"

const orderSelect = Prisma.validator<Prisma.OrderSelect>()({
    id: true,
    paid_at: true,
    created_at: true,
    gross_amount: true,
    status: true,
    midtrans_order_id: true,
    midtrans_token: true,
    midtrans_request: true,
    midtrans_response: true,
    midtrans_redirect: true,
    user: {
        select: {
            name: true,
            email: true,
            image: true,
        },
    },
})

export type GetOrder = Prisma.OrderGetPayload<{select: typeof orderSelect}>

export async function getOrder(id: string): Promise<ServerResult<GetOrder>> {
    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["read orders", "manage orders"])

        const order = await prisma.order.findUnique({
            select: orderSelect,
            where: {
                id: id,
            },
        })

        if (!order) throw new Error("Order not found")

        return {success: true, data: order, message: "Order fetched successfully"}
    } catch (error) {
        return handleServerError(error)
    }
}
