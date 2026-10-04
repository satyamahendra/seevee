"use client"

import React from "react"
import {motion} from "motion/react"
import {useSearchParams} from "next/navigation"
import BoughtItem from "./bought-item"
import type {PurchaseRow} from "../actions"

type BoughtListProps = {
    data: PurchaseRow[]
}

export default function BoughtList({data}: BoughtListProps) {
    const searchParams = useSearchParams()
    const page = searchParams.get("page")
    const ITEMS_PER_PAGE = 10

    return (
        <motion.ul key={page} initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} transition={{bounce: 0}} className="text-sm flex flex-col flex-1">
            {data.map((ph, index: number) => {
                return <BoughtItem key={ph.id} ph={ph} index={index} page={page} itemsPerPage={ITEMS_PER_PAGE} />
            })}
        </motion.ul>
    )
}