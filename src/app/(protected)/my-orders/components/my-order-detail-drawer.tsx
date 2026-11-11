"use client"

import {Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {useQueryParams} from "@/utils/hooks/useQueryParams"
import {useScreenSize} from "@/utils/hooks/useScreenSize"
import {copyToClipboard} from "@/utils/helpers/copyToClipboard"
import {normalizeString} from "@/utils/helpers/normalize-string"
import {format} from "date-fns"
import {toast} from "sonner"
import {PiArrowSquareOut, PiCalendarDots, PiCopy, PiHandshake, PiHash, PiX} from "react-icons/pi"
import {MyOrder} from "../services/get-my-orders"
import {STATUS_VARIANT} from "./my-order-item"

type MyOrderDetailDrawerProps = {
    orders: MyOrder[]
}

// shortcut: only resolves orders on the current page, add a user-scoped getMyOrder if deep links to other pages are needed
const MyOrderDetailDrawer = ({orders}: MyOrderDetailDrawerProps) => {
    const {getParam, setParams} = useQueryParams()
    const {isMobile} = useScreenSize()
    const view = getParam("view") || ""
    const order = orders.find((o) => o.id === view)

    const handleCopy = () => {
        if (!order) return
        copyToClipboard(order.midtrans_order_id)
        toast("Order ID copied to clipboard")
    }

    const rows = order
        ? [
              {label: "Order ID", value: order.midtrans_order_id, icon: <PiHash />},
              {label: "Created", value: format(order.created_at, "dd MMM yyyy, HH:mm"), icon: <PiCalendarDots />},
              {label: "Paid", value: order.paid_at ? format(order.paid_at, "dd MMM yyyy, HH:mm") : "Not paid yet", icon: <PiHandshake />},
          ]
        : []

    return (
        <Drawer swipeDirection={isMobile ? "down" : "right"} open={!!view} onOpenChange={(open) => !open && setParams({view: ""})}>
            <DrawerContent>
                <DrawerHeader className="flex flex-col items-center text-center">
                    <DrawerTitle>Order Details</DrawerTitle>
                    <DrawerDescription>Your credit purchase and payment status</DrawerDescription>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto px-6">
                    {!order ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <PiX />
                                </EmptyMedia>
                                <EmptyTitle>Order Not Found</EmptyTitle>
                                <EmptyDescription>Close this panel and pick an order from the list</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center gap-2 py-2">
                                <span className="text-2xl font-semibold tabular-nums">Rp {order.gross_amount.toLocaleString("id-ID")}</span>
                                <Badge variant={STATUS_VARIANT[order.status]}>{normalizeString(order.status)}</Badge>
                            </div>
                            <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
                                {rows.map((row) => (
                                    <li key={row.label} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-base text-muted-foreground">{row.icon}</div>
                                        <div className="flex min-w-0 flex-1 flex-col">
                                            <span className="text-xs text-muted-foreground">{row.label}</span>
                                            <span className="truncate">{row.value}</span>
                                        </div>
                                        {row.label === "Order ID" && (
                                            <Button aria-label="Copy order ID" className="rounded-lg" onClick={handleCopy} size="icon-sm" variant="ghost">
                                                <PiCopy />
                                            </Button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {order?.status === "pending" && order.midtrans_redirect && (
                    <DrawerFooter>
                        <Button asChild className="w-full">
                            <a href={order.midtrans_redirect} rel="noopener noreferrer">
                                Pay <PiArrowSquareOut />
                            </a>
                        </Button>
                    </DrawerFooter>
                )}
            </DrawerContent>
        </Drawer>
    )
}

export default MyOrderDetailDrawer
