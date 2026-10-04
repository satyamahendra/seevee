import {useEffect, useState} from "react"

type ScreenSize = "sm" | "md" | "lg" | "xl" | "2xl"

const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
}

function getScreenSize(width: number): ScreenSize {
    if (width >= breakpoints["2xl"]) return "2xl"
    if (width >= breakpoints.xl) return "xl"
    if (width >= breakpoints.lg) return "lg"
    if (width >= breakpoints.md) return "md"
    return "sm"
}

export function useScreenSize() {
    const [screenSize, setScreenSize] = useState<ScreenSize>("sm")

    const isMobile = screenSize === "sm"
    const isDesktop = screenSize === "xl" || screenSize === "2xl"

    useEffect(() => {
        const handleResize = () => {
            setScreenSize(getScreenSize(window.innerWidth))
        }

        window.addEventListener("resize", handleResize)
        handleResize()

        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return {isMobile, isDesktop, screenSize}
}
