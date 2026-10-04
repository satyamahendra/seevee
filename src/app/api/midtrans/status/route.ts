import {OrderStatus, Prisma} from "@/generated/index"
import {authServer} from "@/lib/auth-server"
import {snap} from "@/lib/midtrans/snap"
import prisma from "@/lib/prisma/client"
import {grantPurchaseCredits} from "@/utils/services/grant-purchase-credits"
import {apiError, apiSuccess} from "@/utils/types/api-routes"
import {NextRequest, NextResponse} from "next/server"

export async function GET(req: NextRequest): Promise<NextResponse> {
    const midtransOrderIdReq = req.nextUrl.searchParams.get("order_id")

    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")

        const transaction = await snap.transaction.status(midtransOrderIdReq ?? "")

        const transactionStatus = transaction.transaction_status
        const fraudStatus = transaction.fraud_status
        const midtransOrderId = transaction.order_id

        let status = "pending"
        if (transactionStatus == "capture") {
            if (fraudStatus == "challenge") {
                status = "pending"
            } else if (fraudStatus == "accept") {
                status = "success"
            }
        } else if (transactionStatus == "settlement") {
            status = "success"
        } else if (transactionStatus == "deny") {
            status = "deny"
        } else if (transactionStatus == "cancel") {
            status = "cancel"
        } else if (transactionStatus == "expire") {
            status = "expire"
        }

        const order = await prisma.order.findUnique({
            where: {midtrans_order_id: midtransOrderId as string},
        })

        if (!order) throw new Error("Order not found")

        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: {id: order.id},
                data: {
                    status: status as OrderStatus,
                    midtrans_response: status === "success" ? (transaction as Prisma.InputJsonValue) : Prisma.JsonNull,
                    paid_at: transaction?.settlement_time ? new Date(transaction.settlement_time as string) : null,
                },
            })

            if (status === "success") {
                await grantPurchaseCredits(tx, order)
            }
        })

        return apiSuccess(transaction, "Transaction status updated successfully", 200)
    } catch (error) {
        return apiError(error)
    }
}
