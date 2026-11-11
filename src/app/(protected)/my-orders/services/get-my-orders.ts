"use server"

import {Prisma} from "@/generated/index"
import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {PAGE_SIZE} from "@/utils/constants/pagination"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {Pagination} from "@/utils/types/pagination"
import {ServerResult} from "@/utils/types/server-action"

const myOrderSelect = Prisma.validator<Prisma.OrderSelect>()({
    id: true,
    midtrans_order_id: true,
    midtrans_redirect: true,
    gross_amount: true,
    status: true,
    paid_at: true,
    created_at: true,
})

export type MyOrder = Prisma.OrderGetPayload<{select: typeof myOrderSelect}>

export type GetMyOrders = {
    orders: MyOrder[]
    pagination: Pagination
}

export async function getMyOrders(page: number = 1, search = ""): Promise<ServerResult<GetMyOrders>> {
    const skip = (page - 1) * PAGE_SIZE

    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")

        const where: Prisma.OrderWhereInput = {
            user_id: session.user.id,
            ...(search && {midtrans_order_id: {contains: search, mode: "insensitive"}}),
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({skip, take: PAGE_SIZE, orderBy: {created_at: "desc"}, select: myOrderSelect, where}),
            prisma.order.count({where}),
        ])

        return {
            success: true,
            message: "Orders fetched successfully",
            data: {orders, pagination: {page, total, pageCount: Math.ceil(total / PAGE_SIZE)}},
        }
    } catch (error) {
        return handleServerError(error)
    }
}
