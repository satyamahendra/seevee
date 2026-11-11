"use server"

import prisma from "@/lib/prisma/client"
import {Prisma} from "@/generated/index"
import {ServerResult} from "@/utils/types/server-action"
import {handleServerError} from "@/utils/helpers/handle-server-errors"

const activeProductSelect = {
    id: true,
    name: true,
    price_actual: true,
    price_alternate: true,
    credit: true,
    type: true,
    bundle_items: {select: {product: {select: {name: true}}}},
} satisfies Prisma.ProductSelect

export type ActiveProduct = Prisma.ProductGetPayload<{select: typeof activeProductSelect}>

// Public catalog (also shown on the landing page), so no auth/permission check.
export async function getActiveProducts(): Promise<ServerResult<ActiveProduct[]>> {
    try {
        const data = await prisma.product.findMany({
            where: {is_active: true},
            orderBy: {created_at: "asc"},
            select: activeProductSelect,
        })
        return {success: true, data, message: "Products fetched"}
    } catch (error) {
        return handleServerError(error)
    }
}
