// useTailwindScreenSizes.ts
import {useEffect, useState} from "react"

// Custom hook to handle screen size changes based on Tailwind's breakpoints.
export function useTWScreenSizes(breakpoint: string) {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia(`(min-width: ${breakpoint})`)

        const handleResize = (e: MediaQueryListEvent) => {
            setMatches(e.matches)
        }

        mediaQuery.addEventListener("change", handleResize)
        setMatches(mediaQuery.matches)

        return () => {
            mediaQuery.removeEventListener("change", handleResize)
        }
    }, [breakpoint])

    return matches
}
