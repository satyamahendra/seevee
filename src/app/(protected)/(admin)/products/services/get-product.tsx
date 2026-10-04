"use server"

import {Prisma} from "@/generated/index"
import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {ServerResult} from "@/utils/types/server-action"
import {requirePermissions} from "@/utils/helpers/has-ability-server"

const productSelect = Prisma.validator<Prisma.ProductSelect>()({
    id: true,
    name: true,
    price_alternate: true,
    price_actual: true,
    credit: true,
    type: true,
    is_active: true,
    bundle_items: {
        select: {
            id: true,
            product: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
})

export type GetProduct = Prisma.ProductGetPayload<{select: typeof productSelect}>

export async function getProduct(id: string): Promise<ServerResult<GetProduct>> {
    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["read products", "manage products"])

        const product = await prisma.product.findUnique({
            select: productSelect,
            where: {
                id: id,
            },
        })

        if (!product) throw new Error("Product not found")

        return {success: true, data: product, message: "Product fetched successfully"}
    } catch (error) {
        return handleServerError(error)
    }
}
