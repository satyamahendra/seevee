"use client"

import React, {useEffect} from "react"
import {Button} from "@/components/ui/button"
import {useUpdateSearchParams} from "@/utils/hooks/useUpSearchParams"
import {usePathname, useSearchParams} from "next/navigation"
import AnimatedContainer from "@/components/custom/animated-container"

type LayoutProps = {
    children: React.ReactNode
}

export default function Layout({children}: LayoutProps) {
    const {setParam} = useUpdateSearchParams()
    const currSearchParams = useSearchParams()
    const pathname = usePathname()

    const type = currSearchParams.get("type")

    useEffect(() => {
        if (pathname === "/history" && currSearchParams.toString() === "") setParam("type", "used")
    }, [pathname, currSearchParams.toString()])

    return (
        <AnimatedContainer className="h-full flex flex-col ">
            <div>
                <h1 className="text-xl font-semibold">History</h1>
                <p className="text-muted-foreground text-sm">Your transaction and purchase history</p>
            </div>

            <div className="flex flex-col gap-4 flex-1 mt-8">
                <div className="flex text-xs items-center gap-2">
                    filter by:
                    <Button
                        onClick={() => {
                            setParam("type", "used", {resetOthers: true})
                        }}
                        size="sm"
                        variant="outline"
                        className={`h-6 px-2 ${type === "used" ? "bg-primary text-primary-foreground" : ""}`}>
                        Credits Used
                    </Button>
                    <Button
                        onClick={() => setParam("type", "bought", {resetOthers: true})}
                        size="sm"
                        variant="outline"
                        className={`h-6 px-2 ${type === "bought" ? "bg-primary text-primary-foreground" : ""}`}>
                        Credits Bought
                    </Button>
                </div>
                <div className="flex-1 flex flex-col">{children}</div>
            </div>
        </AnimatedContainer>
    )
}
