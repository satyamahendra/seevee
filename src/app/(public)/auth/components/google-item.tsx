"use client"

import {Item, ItemContent, ItemMedia, ItemTitle} from "@/components/ui/item"
import {authClient} from "@/lib/auth-client" // your Better Auth client instance
import {FcGoogle} from "react-icons/fc"
import {useState} from "react"
import {PiCircleDashed} from "react-icons/pi"
import {toast} from "sonner"

const GoogleItem = () => {
    const [isLoading, setIsLoading] = useState(false)

    const handleSignIn = async () => {
        setIsLoading(true)
        const {error} = await authClient.signIn.social({
            provider: "google",
            callbackURL: "/resume",
        })
        if (error) {
            toast.error(error.message ?? "Failed to sign in.")
            setIsLoading(false)
        }
    }

    return (
        <Item variant="muted" className="hover:cursor-pointer" onClick={isLoading ? undefined : handleSignIn}>
            <ItemMedia variant="icon" className="text-muted-foreground">
                {isLoading ? <PiCircleDashed className="animate-spin text-base" /> : <FcGoogle className="text-2xl" />}
            </ItemMedia>
            <ItemContent>
                <ItemTitle className="text-muted-foreground">{isLoading ? "Loading..." : "Sign in with Google"}</ItemTitle>
            </ItemContent>
        </Item>
    )
}

export default GoogleItem
