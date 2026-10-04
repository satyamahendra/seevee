"use client"

import React from "react"
import {PiFileText, PiPlusBold} from "react-icons/pi"
import {createResume} from "../action"
import {toast} from "sonner"
import {redirect} from "next/navigation"

export default function CreateResumeCard() {
    async function handleCreateResume() {
        const res = await createResume()
        if (res.error) return toast(`${res.error}`)
        if (res.data) {
            toast.success("Successfully created a new resume!")
            redirect(`/resume/${res?.data?.id}`)
        }
    }

    return (
        <div
            onClick={handleCreateResume}
            className="bg-primary-foreground group hover:bg-muted duration-200 cursor-pointer aspect-square text-muted-foreground rounded-xl p-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed">
            <div className="w-12 text-2xl group-hover:bg-primary-foreground duration-200 h-12 flex items-center justify-center bg-muted rounded-xl border">
                <PiFileText />
            </div>
            <div className="flex items-center text-sm gap-2 group-hover:text-primary duration-200">
                <PiPlusBold /> Create resume
            </div>
        </div>
    )
}
