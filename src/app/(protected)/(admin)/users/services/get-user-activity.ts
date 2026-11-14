"use server"

import {Prisma} from "@/generated/index"
import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {idrToUsdCents} from "@/utils/helpers/format-usd"
import {requirePermissions} from "@/utils/helpers/has-ability-server"
import {ServerResult} from "@/utils/types/server-action"

// shortcut: latest 20 of each, no pagination; add page params if support needs deeper history.
const LIMIT = 20

const orderSelect = Prisma.validator<Prisma.OrderSelect>()({id: true, midtrans_order_id: true, gross_amount: true, status: true, paid_at: true, created_at: true})
// `result` (the AI payload) is skipped: heavy, and not needed for a glance.
const transactionSelect = Prisma.validator<Prisma.CreditTransactionSelect>()({id: true, actionType: true, creditsUsed: true, createdAt: true})

export type UserOrder = Prisma.OrderGetPayload<{select: typeof orderSelect}> & {usd_cents: number | null}
export type UserTransaction = Prisma.CreditTransactionGetPayload<{select: typeof transactionSelect}>
export type UserActivity = {orders: UserOrder[]; transactions: UserTransaction[]}

export async function getUserActivity(userId: string): Promise<ServerResult<UserActivity>> {
    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["read users", "manage users"])

        const [orders, transactions] = await Promise.all([
            prisma.order.findMany({where: {user_id: userId}, orderBy: {created_at: "desc"}, take: LIMIT, select: orderSelect}),
            prisma.creditTransaction.findMany({where: {userId, actionType: {not: "purchase"}}, orderBy: {createdAt: "desc"}, take: LIMIT, select: transactionSelect}),
        ])

        return {
            success: true,
            data: {orders: orders.map((o) => ({...o, usd_cents: idrToUsdCents(o.gross_amount)})), transactions},
            message: "Activity fetched successfully",
        }
    } catch (error) {
        return handleServerError(error)
    }
}
