import {OrderStatus} from "@/generated/index"
import prisma from "@/lib/prisma/client"
import {sha512} from "@/utils/helpers/sha512"
import {grantPurchaseCredits} from "@/utils/services/grant-purchase-credits"
import {apiError, apiSuccess} from "@/utils/types/api-routes"
import {NextRequest} from "next/server"

export async function POST(req: NextRequest) {
    try {
        const transaction = await req.json()

        const signature = await sha512(transaction.order_id + transaction.status_code + transaction.gross_amount + process.env.MIDTRANS_SERVER_KEY)
        if (signature !== transaction.signature_key) throw new Error("Invalid signature")

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
            where: {midtrans_order_id: midtransOrderId},
        })

        if (!order) throw new Error("Order not found")
        if (Number(transaction.gross_amount) !== order.gross_amount) throw new Error("Amount mismatch")

        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: {id: order.id},
                data: {
                    status: status as OrderStatus,
                    midtrans_response: status === "success" ? transaction : null,
                    paid_at: transaction?.settlement_time ? new Date(transaction?.settlement_time) : null,
                },
            })

            if (status === "success") {
                await grantPurchaseCredits(tx, order)
            }
        })

        return apiSuccess(transaction, "Transaction status updated successfully", 200)
    } catch (error) {
        console.error(`[webhook] ${error instanceof Error ? error.message : "unknown error"}`)
        return apiError(error)
    }
}
