"use server"

import prisma from "@/lib/prisma/client"
import {Prisma} from "@/generated/index"
import {ServerResult} from "@/utils/types/server-action"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {usdCentsToIdr, usdToIdrRate} from "@/utils/helpers/format-usd"

const activeProductSelect = {
    id: true,
    name: true,
    price_actual: true,
    price_alternate: true,
    credit: true,
    type: true,
    bundle_items: {select: {product: {select: {name: true}}}},
} satisfies Prisma.ProductSelect

// price_idr is computed here because USD_TO_IDR is server-only and client callers can't read it; null when unset.
export type ActiveProduct = Prisma.ProductGetPayload<{select: typeof activeProductSelect}> & {price_idr: number | null}

// Public catalog (also shown on the landing page), so no auth/permission check.
export async function getActiveProducts(): Promise<ServerResult<ActiveProduct[]>> {
    try {
        const products = await prisma.product.findMany({
            where: {is_active: true},
            orderBy: {created_at: "asc"},
            select: activeProductSelect,
        })
        const rate = usdToIdrRate()
        const data = products.map((p) => ({...p, price_idr: rate ? usdCentsToIdr(p.price_actual) : null}))
        return {success: true, data, message: "Products fetched"}
    } catch (error) {
        return handleServerError(error)
    }
}
