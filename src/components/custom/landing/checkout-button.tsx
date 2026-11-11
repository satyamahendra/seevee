"use client"

import {Button} from "@/components/ui/button"
import Link from "next/link"
import {useRouter} from "next/navigation"
import {useMutation} from "@tanstack/react-query"
import axios from "axios"
import {authClient} from "@/lib/auth-client"
import {handleClientError} from "@/utils/helpers/handle-client-errors"
import {toast} from "sonner"
import {Loader2} from "lucide-react"

// onBeforePay: lets a host modal close first, so its focus trap/pointer lock does not block the Snap popup
export default function CheckoutButton({productId, onBeforePay}: {productId: string; onBeforePay?: () => void}) {
    const {data: session, refetch} = authClient.useSession()
    const router = useRouter()

    const {mutate, isPending} = useMutation({
        mutationFn: async () => await axios.post("/api/midtrans/token", {id_product: productId}),
        onSuccess: (data) => {
            onBeforePay?.()
            window.snap.pay(data.data.data.token, {
                onSuccess: async (result) => {
                    toast.success("Payment successful!")
                    // sync status (idempotent grant) so credits exist before the webhook lands, then reload session credits
                    await axios.get(`/api/midtrans/status?order_id=${(result as {order_id: string}).order_id}`).catch(() => {})
                    await refetch()
                    router.refresh()
                },
                onError: () => toast.error("Something went wrong."),
            })
        },
        onError: (error) => {
            toast.error(handleClientError(error))
        },
    })

    if (!session)
        return (
            <Link href="/auth">
                <Button className="w-full">Get Started</Button>
            </Link>
        )

    return (
        <Button disabled={isPending} onClick={() => mutate()} className="w-full">
            {isPending ? <Loader2 className="animate-spin" /> : "Buy credits"}
        </Button>
    )
}