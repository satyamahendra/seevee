"use client"

import {Button} from "@/components/ui/button"
import {handleClientError} from "@/utils/helpers/handle-client-errors"
import {useMutation, useQuery} from "@tanstack/react-query"
import axios from "axios"
import {toast} from "sonner"

const ProductItem = () => {
    const {mutate, isPending} = useMutation({
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

    const {refetch: refetchOrder} = useQuery({
        queryKey: ["order"],
        queryFn: async () => await axios.get("/api/midtrans/status?order_id=ba3c6f25-64b1-4530-9c6c-41aba9ccde65"),
        enabled: false,
    })

    const handleCheckOrderStatus = async () => {
        await refetchOrder()
    }

    return (
        <div>
            <h1>
                <Button disabled={isPending} onClick={() => mutate({id_product: "a654e415-f7c8-43cd-96dd-e6064abae30e"})}>
                    {isPending ? "Loading..." : "Checkout"}
                </Button>
                <Button onClick={handleCheckOrderStatus}>Check Status</Button>
            </h1>
        </div>
    )
}

export default ProductItem
