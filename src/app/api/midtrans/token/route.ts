import {TokenParameter} from "@/lib/midtrans/types/midtrans"
import {snap} from "@/lib/midtrans/snap"
import {authServer} from "@/lib/auth-server"
import {apiError, apiSuccess} from "@/utils/types/api-routes"
import {NextRequest} from "next/server"
import {v4 as uuidv4} from "uuid"
import prisma from "@/lib/prisma/client"
import {usdCentsToIdr} from "@/utils/helpers/format-usd"

export async function POST(req: NextRequest) {
    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")

        const body = await req.json()

        const product = await prisma.product.findUnique({
            where: {
                id: body.id_product,
            },
            include: {
                bundle_items: {
                    select: {
                        product: {
                            select: {
                                id: true,
                                price_actual: true,
                                name: true,
                                type: true,
                            },
                        },
                    },
                },
            },
        })
        if (!product) throw new Error("Product not found")
        const idr = usdCentsToIdr(product.price_actual)

        const itemDetails = [
            {
                id: `${product.type === "bundle" ? "bundle_" : ""}${product.id}`,
                price: idr,
                quantity: 1,
                name: product.name,
            },
        ]
        if (product.type === "bundle") {
            const bundleItems = product.bundle_items.map((item) => ({
                id: `${item.product.id}`,
                // price: item.product.price_actual,
                price: 0,
                quantity: 1,
                name: item.product.name,
            }))
            itemDetails.push(...bundleItems)
        }

        // resume the last pending order for this product/price instead of opening a new transaction
        // shortcut: assumes default 24h Snap token expiry, read the configured expiry if `expiry` is ever set on createTransaction
        const pending = await prisma.order.findFirst({
            where: {
                user_id: session.user.id,
                status: "pending",
                gross_amount: idr,
                created_at: {gt: new Date(Date.now() - 24 * 60 * 60 * 1000)},
                midtrans_token: {not: null},
                midtrans_request: {path: ["item_details", "0", "id"], equals: itemDetails[0].id},
            },
            orderBy: {created_at: "desc"},
        })
        if (pending) {
            return apiSuccess({token: pending.midtrans_token, redirect_url: pending.midtrans_redirect, order: pending}, "Resumed pending order", 200)
        }

        const orderId = uuidv4()
        const parameter: TokenParameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: idr,
            },
            credit_card: {secure: true},
            item_details: itemDetails,
            customer_details: {
                first_name: session?.user?.name,
                email: session?.user?.email,
            },
        }

        const data = await snap.createTransaction(parameter)

        const order = await prisma.order.create({
            data: {
                midtrans_order_id: orderId,
                user_id: session.user.id,
                gross_amount: idr,
                midtrans_request: parameter,
                midtrans_token: data.token,
                midtrans_redirect: data.redirect_url,
            },
        })

        return apiSuccess({...data, order}, "Token created successfully", 200)
    } catch (error) {
        return apiError(error)
    }
}
