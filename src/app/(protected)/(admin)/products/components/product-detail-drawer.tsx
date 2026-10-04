"use client"

import {Controller, useFieldArray, useForm} from "react-hook-form"
import {getProduct} from "../services/get-product"
import {ProductFormSchema, productSchema} from "../utils/schema"
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {PiBasket, PiPackage, PiPlus, PiTrash, PiX} from "react-icons/pi"
import {Label} from "@/components/ui/label"
import {getProducts} from "../services/get-products"
import {InfiniteCombobox} from "@/components/custom/combobox"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {createUpdateProduct} from "../services/create-update-product"
import {toast} from "sonner"
import {useQueryParams} from "@/utils/hooks/useQueryParams"
import {Loader2} from "lucide-react"
import {useTransition} from "react"
import {deleteProduct} from "../services/delete-product"
import {Switch} from "@/components/ui/switch"
import {zodResolver} from "@hookform/resolvers/zod"
import {Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import {useScreenSize} from "@/utils/hooks/useScreenSize"
import {cn} from "@/lib/utils"
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty"
import axios from "axios"
import {handleClientError} from "@/utils/helpers/handle-client-errors"

const ProductForm = () => {
    const queryClient = useQueryClient()
    const {setParams, getParam} = useQueryParams()
    const [isPending, startTransition] = useTransition()
    const {isMobile} = useScreenSize()

    const view = getParam("view")

    const {
        data: productData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["product", view],
        queryFn: () => getProduct(view!),
        enabled: !!view && view !== "create",
    })

    const product = productData?.data

    const form = useForm<ProductFormSchema>({
        resolver: zodResolver(productSchema),
        values:
            view === "create"
                ? {
                      id: "",
                      name: "",
                      price_alternate: 0,
                      price_actual: 0,
                      credit: 0,
                      type: "single",
                      is_active: true,
                      bundle_items: [],
                  }
                : {
                      id: product?.id ?? "",
                      name: product?.name ?? "",
                      price_alternate: product?.price_alternate ?? 0,
                      price_actual: product?.price_actual ?? 0,
                      credit: product?.credit ?? 0,
                      type: product?.type ?? "single",
                      is_active: product?.is_active ?? true,
                      bundle_items:
                          product?.bundle_items?.map((item) => ({
                              product_id: {value: item.product?.id, label: item.product?.name},
                          })) ?? [],
                  },
    })

    const {fields, append, remove} = useFieldArray({
        control: form.control,
        name: "bundle_items",
    })

    const {mutate} = useMutation({
        mutationFn: createUpdateProduct,
        onSuccess: (res) => {
            if (!res.success) return toast.error(res.message)
            toast.success(res.message)
            startTransition(() => {
                queryClient.invalidateQueries({queryKey: ["products"]})
                setParams({view: ""})
            })
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const {mutate: mutateDelete} = useMutation({
        mutationFn: (id: string) => deleteProduct(id),
        onSuccess: (res) => {
            if (!res.success) return toast.error(res.message)
            toast.success(res.message)
            startTransition(() => {
                queryClient.invalidateQueries({queryKey: ["products"]})
                setParams({view: ""})
            })
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const {mutate: mutateBuy, isPending: isBuying} = useMutation({
        mutationFn: async (data: {id_product: string}) => await axios.post("/api/midtrans/token", data),
        onSuccess: (data) => {
            window.snap.pay(data.data.data.token, {
                onSuccess: () => toast.success("Payment successful!"),
                onError: () => toast.error("Something went wrong."),
            })
        },
        onError: (error) => {
            toast.error(handleClientError(error))
        },
    })

    function onSubmit(data: ProductFormSchema) {
        mutate(data)
    }

    return (
        <Drawer swipeDirection={isMobile ? "down" : "right"} open={!!view} onOpenChange={(open) => !open && setParams({view: ""})}>
            <DrawerContent aria-describedby="product-detail" className={cn(isMobile ? "h-[80vh]" : "h-full")}>
                <DrawerHeader className="flex flex-col items-center justify-center">
                    <DrawerTitle className="flex items-center gap-2">
                        <PiPackage />
                        Product
                    </DrawerTitle>
                    <DrawerDescription>View and manage product details.</DrawerDescription>
                    {product && product?.is_active && (
                        <Button
                            className="rounded-lg mt-2 space-x-2"
                            size={"sm"}
                            variant="outline"
                            disabled={isBuying}
                            onClick={() => mutateBuy({id_product: product.id})}>
                            {isBuying ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Buying...
                                </>
                            ) : (
                                <>
                                    <PiBasket /> Test Buy
                                </>
                            )}
                        </Button>
                    )}
                </DrawerHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center h-20">
                        <Loader2 className="animate-spin w-6 h-6" />
                    </div>
                ) : error ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <PiX />
                            </EmptyMedia>
                            <EmptyTitle>Failed to fetch product</EmptyTitle>
                            <EmptyDescription>Failed to fetch product. Please try again.</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="p-6 overflow-y-auto flex-1">
                        <form id="product-form" onSubmit={form.handleSubmit(onSubmit)}>
                            <FieldGroup>
                                <div className="flex gap-4">
                                    <Controller
                                        name="name"
                                        control={form.control}
                                        render={({field, fieldState}) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                                <Input {...field} id="name" aria-invalid={fieldState.invalid} placeholder="Product Name" />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name="type"
                                        control={form.control}
                                        render={({field, fieldState}) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="type">Type</FieldLabel>
                                                <InfiniteCombobox
                                                    value={field.value ? {value: field.value, label: field.value === "single" ? "Single" : "Bundle"} : null}
                                                    onChange={(opt) => field.onChange(opt?.value ?? null)}
                                                    placeholder="Select product type"
                                                    options={[
                                                        {value: "single", label: "Single"},
                                                        {value: "bundle", label: "Bundle"},
                                                    ]}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <Controller
                                        name="price_actual"
                                        control={form.control}
                                        render={({field, fieldState}) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="price_actual">Price Actual</FieldLabel>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    id="price_actual"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="Price Actual"
                                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name="price_alternate"
                                        control={form.control}
                                        render={({field, fieldState}) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="price_alternate">Price Alternate</FieldLabel>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    id="price_alternate"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="Price Alternate"
                                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name="credit"
                                        control={form.control}
                                        render={({field, fieldState}) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="credit">Credits granted</FieldLabel>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    id="credit"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="Credits on purchase"
                                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : 0)}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                </div>

                                <div>
                                    <Controller
                                        name="is_active"
                                        control={form.control}
                                        render={({field, fieldState}) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="is_active">Is active?</FieldLabel>
                                                <Switch checked={field?.value} onCheckedChange={field.onChange} id="is_active" aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label>Bundle Items</Label>
                                        <Button size="icon-xs" type="button" onClick={() => append({product_id: {label: "", value: ""}})} variant="outline">
                                            <PiPlus />
                                        </Button>
                                    </div>
                                    {fields.map((_, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                            <Controller
                                                name={`bundle_items.${index}.product_id`}
                                                control={form.control}
                                                render={({field, fieldState}) => {
                                                    const error = form.formState.errors.bundle_items?.[index]?.product_id?.value
                                                    return (
                                                        <Field data-invalid={fieldState.invalid} className="w-full">
                                                            <div className="flex gap-4 items-center">
                                                                <InfiniteCombobox
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    placeholder="Select a product"
                                                                    queryKey={["products"]}
                                                                    invalid={fieldState.invalid}
                                                                    queryFn={(page, search) => getProducts(page, search)}
                                                                    getItems={(page) =>
                                                                        page.data?.products.map((p) => ({
                                                                            value: p.id,
                                                                            label: `${p.name}`,
                                                                        })) ?? []
                                                                    }
                                                                    getNextPage={(page) => {
                                                                        if (!page.data) return undefined
                                                                        const {page: current, pageCount} = page.data.pagination
                                                                        return current < pageCount ? current + 1 : undefined
                                                                    }}
                                                                />
                                                                <Button variant="destructive" type="button" size="icon" onClick={() => remove(index)}>
                                                                    <PiTrash />
                                                                </Button>
                                                            </div>
                                                            {fieldState.invalid && <FieldError errors={[error]} />}
                                                        </Field>
                                                    )
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </FieldGroup>
                        </form>
                    </div>
                )}

                <DrawerFooter>
                    <DrawerClose
                        render={
                            <Button variant="outline" className="w-full">
                                Cancel
                            </Button>
                        }></DrawerClose>
                    <div className="flex w-full gap-2">
                        {product && (
                            <Button disabled={isPending} onClick={() => mutateDelete(product.id)} variant={"destructive"} type="button" className="flex-1">
                                <PiTrash /> {isPending ? <Loader2 className="animate-spin" /> : "Delete Product"}
                            </Button>
                        )}
                        <Button disabled={isPending} type="submit" form="product-form" className="flex-1">
                            {isPending ? <Loader2 className="animate-spin" /> : "Submit"}
                        </Button>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default ProductForm
