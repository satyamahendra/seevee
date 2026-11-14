"use client"

import {Button} from "@/components/ui/button"
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
        <Button type="button" variant="outline" size="lg" className="h-10 w-full bg-background" disabled={isLoading} onClick={handleSignIn}>
            {isLoading ? <PiCircleDashed className="animate-spin" /> : <FcGoogle className="size-5" />}
            {isLoading ? "Loading..." : "Sign in with Google"}
        </Button>
    )
}

export default GoogleItem
