"use client"

import React from "react"
import {useQuery} from "@tanstack/react-query"
import {Loader2} from "lucide-react"
import {PiPlusBold} from "react-icons/pi"
import {Button} from "../ui/button"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from "../ui/dialog"
import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "../ui/card"
import {Badge} from "../ui/badge"
import CheckoutButton from "@/components/custom/landing/checkout-button"
import {getActiveProducts} from "@/utils/services/get-active-products"
import {formatUsd} from "@/utils/helpers/format-usd"

type UserCreditsBoxProps = {
    credits: number
}

export default function UserCreditsBox({credits}: UserCreditsBoxProps) {
    const [open, setOpen] = React.useState(false)
    const {data: res, isPending} = useQuery({
        queryKey: ["active-products"],
        queryFn: getActiveProducts,
        enabled: open,
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="cursor-pointer" size="sm">
                    <div className="border-r px-2 py-1 flex items-center gap-1 font-semibold">
                        <PiPlusBold /> Get Credits
                    </div>
                    <div className="px-2 py-1 flex items-center justify-center gap-1 font-semibold">
                        {credits}
                        <div className="w-1.5 h-1.5 rotate-45 bg-primary"></div>
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Get credits</DialogTitle>
                    <DialogDescription>You have {credits} credits. Pick a pack to top up.</DialogDescription>
                </DialogHeader>
                {isPending ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-muted-foreground" />
                    </div>
                ) : !res?.success ? (
                    <p className="py-8 text-center text-muted-foreground">{res?.message ?? "Failed to load products."}</p>
                ) : res.data.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No credit packs available right now.</p>
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {res.data.map((product) => {
                            const savings =
                                product.price_alternate > product.price_actual
                                    ? Math.round((1 - product.price_actual / product.price_alternate) * 100)
                                    : 0
                            return (
                                <li key={product.id} className="flex">
                                    <Card className="w-full">
                                        <CardHeader>
                                            <CardTitle>{product.name}</CardTitle>
                                            {product.type === "bundle" && product.bundle_items.length > 0 && (
                                                <CardDescription>
                                                    Includes {product.bundle_items.map((item) => item.product.name).join(", ")}
                                                </CardDescription>
                                            )}
                                            {savings > 0 && (
                                                <CardAction>
                                                    <Badge>-{savings}%</Badge>
                                                </CardAction>
                                            )}
                                        </CardHeader>
                                        <CardContent className="flex-1 gap-1">
                                            <div className="flex items-center gap-2 text-4xl font-semibold tabular-nums">
                                                {product.credit}
                                                <div className="w-2.5 h-2.5 rotate-45 bg-primary"></div>
                                            </div>
                                            <span className="text-sm text-muted-foreground">credits</span>
                                            <div className="mt-3 flex items-baseline gap-2">
                                                <span className="text-xl font-semibold tabular-nums">
                                                    {formatUsd(product.price_actual)}
                                                </span>
                                                {savings > 0 && (
                                                    <span className="text-sm text-muted-foreground line-through">
                                                        {formatUsd(product.price_alternate)}
                                                    </span>
                                                )}
                                            </div>
                                            {product.credit > 0 && (
                                                <span className="text-xs text-muted-foreground">
                                                    {formatUsd(Math.round(product.price_actual / product.credit))} per credit
                                                </span>
                                            )}
                                        </CardContent>
                                        <CardFooter>
                                            <CheckoutButton productId={product.id} onBeforePay={() => setOpen(false)} />
                                        </CardFooter>
                                    </Card>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </DialogContent>
        </Dialog>
    )
}
