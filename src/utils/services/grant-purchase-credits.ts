import {Prisma, Order} from "@/generated/index"

type Tx = Prisma.TransactionClient

// ponytail: grants credits per paid product id once per order (idempotent per order_id).
// Upgrade path: per-line-item credits on multiple paid items if checkout ever sells >1 per order.
export async function grantPurchaseCredits(tx: Tx, order: Order) {
    const request = order.midtrans_request as {item_details?: {id: string; price: number}[]} | null
    const paidItem = request?.item_details?.find((item) => item.price > 0)
    if (!paidItem) return

    const existing = await tx.creditTransaction.findFirst({
        where: {userId: order.user_id, actionType: "purchase", result: {path: ["order_id"], equals: order.midtrans_order_id}},
    })
    if (existing) return

    const product = await tx.product.findUnique({
        where: {id: paidItem.id.replace(/^bundle_/, "")},
        select: {credit: true},
    })
    if (!product || product.credit <= 0) return

    await tx.userCredit.upsert({
        where: {userId: order.user_id},
        create: {userId: order.user_id, totalCredits: product.credit},
        update: {totalCredits: {increment: product.credit}},
    })

    await tx.creditTransaction.create({
        data: {
            userId: order.user_id,
            creditsUsed: product.credit,
            actionType: "purchase",
            result: {order_id: order.midtrans_order_id},
        },
    })
}