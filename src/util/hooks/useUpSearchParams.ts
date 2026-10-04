"use client"

import {useRouter, useSearchParams} from "next/navigation"

type Options = {
    replace?: boolean
    resetOthers?: boolean
}

export function useUpdateSearchParams() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const setParam = (key: string, value: string, options?: Options) => {
        const params = options?.resetOthers ? new URLSearchParams() : new URLSearchParams(searchParams.toString())

        params.set(key, value)
        const url = `?${params.toString()}`

        if (options?.replace) {
            router.replace(url)
        } else {
            router.push(url)
        }
    }

    const removeParam = (key: string, options?: Options) => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete(key)
        const url = `?${params.toString()}`

        if (options?.replace) {
            router.replace(url)
        } else {
            router.push(url)
        }
    }

    return {setParam, removeParam}
}
