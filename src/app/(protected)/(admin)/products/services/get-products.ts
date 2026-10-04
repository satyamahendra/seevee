"use server"

import {Prisma} from "@/generated/index"
import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {PAGE_SIZE} from "@/utils/constants/pagination"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {Pagination} from "@/utils/types/pagination"
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
        include: {
            product: {
                select: {
                    id: true,
                },
            },
        },
    },
})

export type GetProduct = Prisma.ProductGetPayload<{select: typeof productSelect}>

export type GetProducts = {
    products: GetProduct[]
    pagination: Pagination
}

export async function getProducts(page: number = 1, search = "", limit = PAGE_SIZE): Promise<ServerResult<GetProducts>> {
    const skip = (page - 1) * limit

    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["read products", "manage products"])

        const where: Prisma.ProductWhereInput = search
            ? {
                  OR: [{name: {contains: search, mode: "insensitive"}}],
              }
            : {}

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                skip,
                take: limit,
                orderBy: {created_at: "asc"},
                select: productSelect,
                where,
            }),
            prisma.product.count({
                where,
            }),
        ])

        return {
            success: true,
            message: "Order fetched successfully",
            data: {
                products,
                pagination: {
                    page,
                    total,
                    pageCount: Math.ceil(total / limit),
                },
            },
        }
    } catch (error) {
        return handleServerError(error)
    }
}
