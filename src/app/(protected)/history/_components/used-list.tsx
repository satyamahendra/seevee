"use client"

import {format} from "date-fns"
import React from "react"
import {motion} from "motion/react"
import {useSearchParams} from "next/navigation"
import type {CreditTransactionRow} from "../actions"

type UsedListProps = {
    data: CreditTransactionRow[]
}

export default function UsedList({data}: UsedListProps) {
    const searchParams = useSearchParams()
    const page = searchParams.get("page")
    const ITEMS_PER_PAGE = 10

    return (
        <motion.ul key={page} initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} transition={{bounce: 0}} className="text-sm flex flex-col flex-1">
            {data.map((ct, index: number) => (
                <li key={ct.id} className="grid pt-3 grid-cols-4 px-4 border-b pb-3 hover:bg-primary-foreground duration-200">
                    <div>{(Number(page ? page : 1) - 1) * ITEMS_PER_PAGE + index + 1}</div>
                    <div className="text-start flex items-center gap-2">
                        <span>-{ct.creditsUsed}</span> <div className="w-2 h-2 bg-primary rotate-45"></div> <span>Credit</span>
                    </div>
                    <div className="text-center">{ct.actionType}</div>
                    <div className="text-end">{format(new Date(ct.createdAt), "d MMMM yyyy")}</div>
                </li>
            ))}
        </motion.ul>
    )
}