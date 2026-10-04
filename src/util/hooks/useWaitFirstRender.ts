import {useEffect, useState} from "react"

export function useDelay(delay = 1000) {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), delay)
        return () => clearTimeout(timer)
    }, [delay])

    return isReady
}
