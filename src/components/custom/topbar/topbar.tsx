"use client"

import {Button} from "@/components/ui/button"
import {authClient} from "@/lib/auth-client"
import {useTheme} from "next-themes"
import {PiCircleDashed, PiMoon, PiSignOut, PiSun} from "react-icons/pi"
import {useState, useEffect} from "react" // 1. Import useEffect
import {toast} from "sonner"
import {redirect} from "next/navigation"
import {useScreenSize} from "@/utils/hooks/useScreenSize"
import UserCreditsBox from "@/components/custom/user-credits-box"

const Topbar = () => {
    const {setTheme, theme} = useTheme()
    const {isMobile} = useScreenSize()
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const {data: session} = authClient.useSession()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleLogout = async () => {
        setIsLoading(true)
        const res = await authClient.signOut()
        if (!res?.data?.success) {
            toast.error("Failed to log out")
            setIsLoading(false)
        }
        redirect("/auth")
    }

    return (
        <header className="w-full border-b flex justify-center">
            <div className="max-w-300 w-full flex justify-between px-6 py-2 items-center">
                {mounted && !isMobile && (
                    <div className="flex gap-3 items-center text-lg tracking-tighter font-light">
                        <div className="aspect-square w-3 h-3 rotate-45 rounded-xs bg-primary"></div>
                        seevee
                    </div>
                )}
                <ul className="flex gap-2 ml-auto items-center">
                    <li>
                        <UserCreditsBox credits={session?.user?.totalCredits ?? 0} />
                    </li>
                    <li>
                        <Button
                            onClick={() => {
                                setTheme(theme === "dark" ? "light" : "dark")
                            }}
                            variant={"outline"}
                            className="rounded-lg cursor-pointer"
                            size="icon-sm">
                            {!mounted ? <div className="w-4.5 h-4.5" /> : theme === "dark" ? <PiMoon /> : <PiSun />}
                        </Button>
                    </li>
                    <li>
                        <Button onClick={handleLogout} disabled={isLoading} variant={"outline"} className="rounded-lg cursor-pointer" size="icon-sm">
                            {isLoading ? <PiCircleDashed className="animate-spin" /> : <PiSignOut />}
                        </Button>
                    </li>
                </ul>
            </div>
        </header>
    )
}

export default Topbar
