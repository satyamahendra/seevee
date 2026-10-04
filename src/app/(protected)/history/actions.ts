"use server"

import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"

export type CreditTransactionRow = {
    id: string
    userId: string
    creditsUsed: number
    result: unknown
    actionType: string
    createdAt: Date
    updatedAt: Date
}

export type PurchaseRow = {
    id: string
    orderId: string
    creditsAdded: number
    amountPaid: number
    paymentStatus: string
    redirectUrl: string | null
    createdAt: Date
}

export const getCreditTransactions = async (page: number = 1, limit: number = 10) => {
    try {
        const session = await authServer()

        if (!session?.user) throw new Error("Unauthorized!")

        const userId = session.user.id

        const where = {userId, actionType: {not: "purchase"}}

        const [totalCount, data] = await Promise.all([
            prisma.creditTransaction.count({where}),
            prisma.creditTransaction.findMany({
                where,
                orderBy: {createdAt: "desc"},
                skip: (page - 1) * limit,
                take: limit,
            }),
        ])

        const totalPages = Math.ceil(totalCount / limit)

        return {
            data: {
                data,
                metadata: {
                    page,
                    limit,
                    totalCount,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            },
        }
    } catch (error) {
        if (error instanceof Error) return {error: error.message}
        return {error: "Something went wrong..."}
    }
}

export const getPurchaseHistory = async (page: number = 1, limit: number = 10) => {
    try {
        const session = await authServer()

        if (!session?.user) throw new Error("Unauthorized!")

        const userId = session.user.id

        const totalCount = await prisma.order.count({where: {user_id: userId}})

        const orders = await prisma.order.findMany({
            where: {user_id: userId},
            orderBy: {created_at: "desc"},
            skip: (page - 1) * limit,
            take: limit,
        })

        const purchases = await prisma.creditTransaction.findMany({
            where: {userId, actionType: "purchase"},
            select: {creditsUsed: true, result: true},
        })

        const data: PurchaseRow[] = orders.map((o) => ({
            id: o.id,
            orderId: o.midtrans_order_id,
            creditsAdded:
                purchases.find((p) => (p.result as {order_id?: string} | null)?.order_id === o.midtrans_order_id)?.creditsUsed ?? 0,
            amountPaid: o.gross_amount,
            paymentStatus: o.status,
            redirectUrl: o.midtrans_redirect,
            createdAt: o.created_at,
        }))

        const totalPages = Math.ceil(totalCount / limit)

        return {
            data: {
                data,
                metadata: {
                    page,
                    limit,
                    totalCount,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            },
        }
    } catch (error) {
        if (error instanceof Error) return {error: error.message}
        return {error: "Something went wrong..."}
    }
}