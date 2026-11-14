"use client"

import {MyOrder} from "../services/get-my-orders"
import {format} from "date-fns"
import {Badge} from "@/components/ui/badge"
import {normalizeString} from "@/utils/helpers/normalize-string"
import {PiArrowsClockwise, PiCalendarDots, PiHash, PiReceipt} from "react-icons/pi"
import {Button} from "@/components/ui/button"
import {useQuery} from "@tanstack/react-query"
import axios from "axios"
import {toast} from "sonner"
import {useRouter} from "next/navigation"
import {Loader2} from "lucide-react"
import ListItem from "@/components/custom/item"
import {useQueryParams} from "@/utils/hooks/useQueryParams"
import {authClient} from "@/lib/auth-client"
import {formatIdr, formatUsd} from "@/utils/helpers/format-usd"

type MyOrderItemProps = {
    order: MyOrder
}

export const STATUS_VARIANT = {
    success: "default",
    settlement: "default",
    pending: "outline",
    accept: "outline",
    deny: "destructive",
    cancel: "destructive",
    expire: "destructive",
} as const

const MyOrderItem = ({order}: MyOrderItemProps) => {
    const router = useRouter()
    const {refetch: refetchSession} = authClient.useSession()
    const {setParams} = useQueryParams()
    const openDetail = () => setParams({view: order.id})

    const isSuccess = order.status === "success" || order.status === "settlement"
    const isPending = order.status === "pending"

    const {refetch, isFetching} = useQuery({
        queryKey: ["my-orders", order.id],
        queryFn: async () => await axios.get(`/api/midtrans/status?order_id=${order.midtrans_order_id}`),
        staleTime: 0,
        enabled: false,
    })

    const handleCheckStatus = async () => {
        const res = await refetch()
        if (!res.isSuccess) return toast.error("Failed to fetch order status")
        await refetchSession()
        router.refresh()
        return toast.success("Order status updated")
    }

    // pay in-app with the stored Snap token; the status check syncs the order once the popup reports back
    const handlePay = () => {
        if (!window.snap || !order.midtrans_token) return toast.error("Payment is not available. Try again in a moment.")
        window.snap.pay(order.midtrans_token, {
            onSuccess: handleCheckStatus,
            onPending: handleCheckStatus,
            onError: () => toast.error("Payment failed. Try again."),
        })
    }

    return (
        <ListItem
            className="cursor-pointer outline-none last:border-b-0 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
            role="button"
            tabIndex={0}
            aria-label={`View order ${order.midtrans_order_id}`}
            onClick={openDetail}
            onKeyDown={(e) => {
                if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault()
                    openDetail()
                }
            }}
            media={
                <div className="mr-3 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg text-muted-foreground">
                    <PiReceipt />
                </div>
            }
            title={
                <span className="flex items-baseline gap-2 tabular-nums">
                    {order.usd_cents === null ? formatIdr(order.gross_amount) : formatUsd(order.usd_cents)}
                    {order.usd_cents !== null && <span className="text-xs font-normal text-muted-foreground">Charged as {formatIdr(order.gross_amount)}</span>}
                </span>
            }
            description={
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="flex items-center gap-1">
                        <PiCalendarDots />
                        {format(order.created_at, "dd MMM yyyy, HH:mm")}
                    </span>
                    <span className="flex min-w-0 items-center gap-1">
                        <PiHash className="shrink-0" />
                        <span className="truncate">{order.midtrans_order_id}</span>
                    </span>
                </div>
            }
            actions={
                <div className="contents" onClick={(e) => e.stopPropagation()}>
                    <Badge variant={STATUS_VARIANT[order.status]}>{normalizeString(order.status)}</Badge>
                    {isPending && order.midtrans_token && (
                        <Button size="sm" className="rounded-lg" onClick={handlePay}>
                            Pay
                        </Button>
                    )}
                    {!isSuccess && (
                        <Button aria-label="Refresh status" className="rounded-lg" disabled={isFetching} onClick={handleCheckStatus} size="icon-sm" variant="ghost">
                            {isFetching ? <Loader2 className="animate-spin" /> : <PiArrowsClockwise />}
                        </Button>
                    )}
                </div>
            }
        />
    )
}

export default MyOrderItem
