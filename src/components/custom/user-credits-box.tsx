"use client"

import React from "react"
import Link from "next/link"
import {PiPlusBold} from "react-icons/pi"

type UserCreditsBoxProps = {
    credits: number
}

export default function UserCreditsBox({credits}: UserCreditsBoxProps) {
    return (
        <Link href="/#pricing" className="cursor-pointer h-8 flex items-center text-xs border rounded-md bg-primary-foreground">
            <div className="border-r px-2 py-1 flex items-center gap-1 font-semibold">
                <PiPlusBold /> Get Credits
            </div>
            <div className="px-2 py-1 flex items-center justify-center gap-1 font-semibold">
                {credits}
                <div className="w-1.5 h-1.5 rotate-45 bg-primary"></div>
            </div>
        </Link>
    )
}
