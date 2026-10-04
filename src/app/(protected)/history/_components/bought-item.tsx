"use client"

import {Button} from "@/components/ui/button"
import {convertIdrToUsd} from "@/util/helpers/convertIDRtoUSD"
import {formatNumberWithCommas} from "@/util/helpers/formatNumberWithCommas"
import {normalizeText} from "@/util/helpers/normalizeText"
import {useMutation} from "@tanstack/react-query"
import {format} from "date-fns"
import {useRouter} from "next/navigation"
import {PiArrowSquareOut, PiCheckCircleFill} from "react-icons/pi"
import {toast} from "sonner"
import type {PurchaseRow} from "../actions"

type BoughtItemProps = {
    ph: PurchaseRow
    index: number
    page: string | null
    itemsPerPage: number
}

export default function BoughtItem({ph, index, page, itemsPerPage}: BoughtItemProps) {
    const router = useRouter()

    const {mutate: checkStatus, isPending} = useMutation({
        mutationFn: (orderId: string) => fetch(`/api/midtrans/status?order_id=${orderId}`),
        onSuccess: async (res) => {
            const data = await res.json()
            if (data.error) toast.error(data.error)
            if (data.data)
                toast.message(`${data.data.status_message}`, {
                    description: `${data.data.transaction_status}, paid for ${data.data.currency} ${data.data.gross_amount} using ${normalizeText(
                        data.data.payment_type
                    )}`,
                })
            router.refresh()
        },
        onError: () => {
            toast.error("Failed to check status")
        },
    })

    const isSettled = ph.paymentStatus === "success"

    return (
        <li key={ph.id} className="grid pt-2 items-center grid-cols-7 px-4 border-b pb-2 hover:bg-primary-foreground duration-200">
            <div>{(Number(page ? page : 1) - 1) * itemsPerPage + index + 1}</div>
            <div className="text-start flex items-center gap-2">
                <span>
                    {isSettled ? "+" : ""}
                    {ph.creditsAdded}
                </span>{" "}
                <div className="w-2 h-2 bg-primary rotate-45"></div> <span>Credits</span>
            </div>
            <div className="text-start flex flex-col">
                <span className="font-semibold">${convertIdrToUsd(ph.amountPaid)}</span>
                <span className="text-xs text-muted-foreground">Rp.{formatNumberWithCommas(ph.amountPaid)}</span>
            </div>
            <div className={`text-start flex items-center gap-1 ${isSettled ? "text-green-500" : "text-muted-foreground"}`}>
                {ph.paymentStatus}
                {isSettled ? <PiCheckCircleFill /> : null}
            </div>
            <div className="text-end">{format(new Date(ph.createdAt), "d MMMM yyyy")}</div>
            {ph.redirectUrl && (
                <a href={ph.redirectUrl} rel="noopener noreferrer" className="ml-auto">
                    <Button size="sm" variant="link" className="flex items-center gap-1 p-0">
                        Payment <PiArrowSquareOut />
                    </Button>
                </a>
            )}
            <Button disabled={isPending} className="h-7 w-24 text-xs ml-auto" size="sm" onClick={() => checkStatus(ph.orderId)}>
                {isPending ? "Checking..." : "Check status"}
            </Button>
        </li>
    )
}