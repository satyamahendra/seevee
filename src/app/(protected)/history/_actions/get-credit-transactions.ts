"use server"

import {Prisma} from "@/generated/index"
import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {PAGE_SIZE} from "@/utils/constants/pagination"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {Pagination} from "@/utils/types/pagination"
import {ServerResult} from "@/utils/types/server-action"

const creditTransactionSelect = Prisma.validator<Prisma.CreditTransactionSelect>()({
    id: true,
    userId: true,
    creditsUsed: true,
    result: true,
    actionType: true,
    createdAt: true,
    updatedAt: true,
})

export type CreditTransactionRow = Prisma.CreditTransactionGetPayload<{select: typeof creditTransactionSelect}>

export type GetCreditTransactions = {
    transactions: CreditTransactionRow[]
    pagination: Pagination
}

export const getCreditTransactions = async (page: number = 1, limit: number = 10): Promise<ServerResult<GetCreditTransactions>> => {
    const skip = (page - 1) * PAGE_SIZE

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
                select: creditTransactionSelect,
                skip,
                take: PAGE_SIZE,
            }),
        ])

        return {
            success: true,
            message: "Credit transactions fetched successfully",
            data: {
                transactions: data,
                pagination: {
                    page,
                    total: totalCount,
                    pageCount: Math.ceil(totalCount / limit),
                },
            },
        }
    } catch (error) {
        return handleServerError(error)
    }
}
