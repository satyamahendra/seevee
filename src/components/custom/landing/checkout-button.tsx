"use client"

import {Button} from "@/components/ui/button"
import Link from "next/link"
import {useMutation} from "@tanstack/react-query"
import axios from "axios"
import {authClient} from "@/lib/auth-client"
import {handleClientError} from "@/utils/helpers/handle-client-errors"
import {toast} from "sonner"
import {Loader2} from "lucide-react"

export default function CheckoutButton({productId}: {productId: string}) {
    const {data: session} = authClient.useSession()

    const {mutate, isPending} = useMutation({
        mutationFn: async () => await axios.post("/api/midtrans/token", {id_product: productId}),
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