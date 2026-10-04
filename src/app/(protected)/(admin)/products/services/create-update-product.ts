// action.ts
"use server"

import prisma from "@/lib/prisma/client"
import {revalidatePath} from "next/cache"
import {ServerResult} from "@/utils/types/server-action"
import {Product} from "@/generated/index"
import {authServer} from "@/lib/auth-server"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {ProductFormSchema, productSchema} from "../utils/schema"

export async function createUpdateProduct(data: ProductFormSchema): Promise<ServerResult<Pick<Product, "id">>> {
    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")

        const parsed = productSchema.parse(data)

        const {id, name, type, price_actual, price_alternate, credit, bundle_items, is_active} = parsed

        const bundleItemsPayload =
            bundle_items &&
            bundle_items.map((item) => ({
                product: {connect: {id: item.product_id!.value}},
            }))

        let product: Pick<Product, "id">

        if (id) {
            product = await prisma.product.update({
                where: {id},
                data: {
                    name,
                    type,
                    price_actual,
                    price_alternate,
                    credit,
                    is_active,
                    bundle_items: {
                        deleteMany: {},
                        create: bundleItemsPayload,
                    },
                },
                select: {id: true},
            })
        } else {
            product = await prisma.product.create({
                data: {
                    name,
                    type,
                    price_actual,
                    price_alternate,
                    credit,
                    is_active,
                    bundle_items: {
                        create: bundleItemsPayload,
                    },
                },
                select: {id: true},
            })
        }

        revalidatePath("/products")

        const action = id ? "updated" : "created"
        return {success: true, data: product, message: `Product ${action} successfully`}
    } catch (error) {
        console.log(error)
        return handleServerError(error)
    }
}
