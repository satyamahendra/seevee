"use client"

import {Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import {useQueryParams} from "@/utils/hooks/useQueryParams"
import {useScreenSize} from "@/utils/hooks/useScreenSize"
import {cn} from "@/lib/utils"
import {PiArrowsClockwise, PiArrowSquareOut, PiCalendarDots, PiCheckCircle, PiCoin, PiHandshake, PiLink, PiMoney, PiTicket, PiX} from "react-icons/pi"
import {useQuery, useQueryClient} from "@tanstack/react-query"
import {getOrder} from "../services/get-order"
import {Loader2} from "lucide-react"
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty"
import {format} from "date-fns"
import AnimDiv from "@/components/custom/anim-div"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import axios from "axios"
import {Button} from "@/components/ui/button"
import {toast} from "sonner"
import {useRouter} from "next/navigation"

const OrderDetailDrawer = () => {
    const {setParams, getParam} = useQueryParams()
    const queryClient = useQueryClient()
    const {isMobile} = useScreenSize()
    const router = useRouter()
    const view = getParam("view") || ""

    const {data: orderData, isLoading} = useQuery({
        queryKey: ["order", view],
        queryFn: () => getOrder(view),
        enabled: !!view,
    })

    const order = orderData?.data

    const {refetch: refetchOrder, isLoading: isChecking} = useQuery({
        queryKey: ["order"],
        queryFn: async () => await axios.get(`/api/midtrans/status?order_id=${order?.midtrans_order_id}`),
        staleTime: 0,
        enabled: false,
    })

    const handleCheckOrderStatus = async () => {
        const res = await refetchOrder()
        if (!res?.isSuccess) return toast.error("Failed to fetch order status")
        queryClient.invalidateQueries({queryKey: ["order"]})
        router.refresh()
        return toast.success("Order status updated successfully")
    }

    const handleCopy = (value: string) => {
        navigator.clipboard.writeText(value)
    }

    const handleOpenUrl = (url: string) => {
        window.open(url, "_blank")
    }

    const handleOpenMidtransSnap = (token: string) => {
        if (!window.snap) return toast.error("Token is not available.")
        window.snap.pay(token, {
            onSuccess: () => toast.success("Payment successful!"),
            onError: () => toast.error("Something went wrong."),
        })
    }

    const displayData = [
        {label: "Order ID", value: order?.midtrans_order_id, icon: <PiTicket />, handleFn: () => handleCopy(order?.midtrans_order_id ?? "")},
        {label: "Status", value: order?.status, icon: <PiCheckCircle />},
        {label: "Order Created Date", value: order?.created_at ? format(order?.created_at, "dd MMM yyyy HH:mm") : "-", icon: <PiCalendarDots />},
        {label: "Order Paid Date", value: order?.paid_at ? format(order?.paid_at, "dd MMM yyyy HH:mm") : "-", icon: <PiHandshake />},
        {
            label: "Redirect Url",
            value: order?.midtrans_redirect ? (
                <div className="flex items-center gap-2">
                    Open payment <PiArrowSquareOut />
                </div>
            ) : (
                <div>No payment link available</div>
            ),
            icon: <PiLink />,
            handleFn: () => handleOpenUrl(order?.midtrans_redirect ?? ""),
        },
        {label: "Token", value: order?.midtrans_token || "-", icon: <PiCoin />, handleFn: () => handleOpenMidtransSnap(order?.midtrans_token ?? "")},
        {label: "Gross Amount", value: order?.gross_amount, icon: <PiMoney />},
    ]

    return (
        <Drawer swipeDirection={isMobile ? "down" : "right"} open={!!view} onOpenChange={(open) => !open && setParams({view: ""})}>
            <DrawerContent aria-describedby="order-detail" className={cn(isMobile ? "h-[80vh]" : "")}>
                <DrawerHeader className="flex flex-col items-center justify-center">
                    <DrawerTitle className="flex items-center gap-2">
                        <PiTicket />
                        Order Details
                    </DrawerTitle>
                    <DrawerDescription>View order information and payment details.</DrawerDescription>
                </DrawerHeader>

                <div className="px-6 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-20">
                            <Loader2 className="animate-spin text-primary" />
                        </div>
                    ) : !orderData?.success && !!view ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <PiX />
                                </EmptyMedia>
                                <EmptyTitle>Failed to fetch order</EmptyTitle>
                                <EmptyDescription>Failed to fetch order. Please try again.</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <AnimDiv className="w-full">
                            <div className="flex flex-col items-center justify-center">
                                <Avatar className="w-10 h-10 my-2">
                                    <AvatarImage src={order?.user.image || undefined} />
                                    <AvatarFallback>{order?.user.name ? order?.user.name[0].toUpperCase() : "U"}</AvatarFallback>
                                </Avatar>
                                <div className="font-semibold text-lg">{order?.user.name}</div>
                                <div className="text-muted-foreground">{order?.user.email}</div>
                                <Button className="rounded-lg mt-2 space-x-2" disabled={isChecking} onClick={handleCheckOrderStatus} size={"sm"} variant="outline">
                                    {isChecking ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            Checking...
                                        </>
                                    ) : (
                                        <>
                                            <PiArrowsClockwise /> Check order
                                        </>
                                    )}
                                </Button>
                            </div>

                            <ul className="space-y-4 mt-4">
                                {displayData.map((d, index) => {
                                    return (
                                        <li
                                            onClick={() => {
                                                if (!d.handleFn) return
                                                d.handleFn()
                                            }}
                                            className="text-sm flex items-center gap-4 cursor-pointer"
                                            key={index}>
                                            <div className="text-lg bg-muted min-w-7 min-h-7 rounded-sm flex items-center justify-center">{d.icon}</div>
                                            <div>
                                                <div>{d.label}</div>
                                                <div className="text-muted-foreground">{d.value}</div>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </AnimDiv>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default OrderDetailDrawer
