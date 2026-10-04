import {z} from "zod"

const productOptionSchema = z.object({
    label: z.string().min(1, "Please select a product"),
    value: z.string().min(1, "Please select a product"),
})

export const productSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Product name is required"),
    price_alternate: z.number().min(0),
    price_actual: z.number().min(0),
    credit: z.number().min(0),
    type: z.enum(["single", "bundle"]),
    is_active: z.boolean(),
    bundle_items: z
        .array(
            z.object({
                product_id: productOptionSchema,
            }),
        )
        .optional(),
})

export type ProductFormSchema = z.input<typeof productSchema>
