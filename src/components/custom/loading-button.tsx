import React from "react"
import { useFormStatus } from "react-dom"
import { Button } from "../ui/button"

type LoadingButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
    loadingText?: React.ReactNode
    text?: React.ReactNode
}

export default function LoadingButton({loadingText = "Loading...", text = "Submit", ...props}:LoadingButtonProps) {

    const {pending} = useFormStatus()

    return <Button disabled={pending} {...props}>{pending ? loadingText : text}</Button>
}
