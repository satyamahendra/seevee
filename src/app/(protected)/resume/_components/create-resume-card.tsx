"use client"

import React from "react"
import {PiFileText, PiPlusBold} from "react-icons/pi"
import {Loader2} from "lucide-react"
import {useMutation} from "@tanstack/react-query"
import {useRouter} from "next/navigation"
import {createResume} from "../action"
import {toast} from "sonner"

export default function CreateResumeCard() {
    const router = useRouter()

    const {mutate, isPending} = useMutation({
        mutationFn: createResume,
        onSuccess: (res) => {
            if (res.error || !res.data) return toast.error(res.error ?? "Failed to create resume")
            toast.success("Successfully created a new resume!")
            router.push(`/resume/${res.data.id}`)
        },
        onError: (error) => toast.error(error.message),
    })

    return (
        <button
            type="button"
            onClick={() => mutate()}
            disabled={isPending}
            className="group flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card/50 p-4 text-muted-foreground transition-colors hover:border-muted-foreground hover:bg-card hover:text-foreground disabled:cursor-wait disabled:opacity-60">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-muted text-2xl transition-colors group-hover:bg-card">
                {isPending ? <Loader2 className="animate-spin" /> : <PiFileText />}
            </div>
            <div className="flex items-center gap-2 text-sm">
                <PiPlusBold /> {isPending ? "Creating..." : "Create resume"}
            </div>
        </button>
    )
}
