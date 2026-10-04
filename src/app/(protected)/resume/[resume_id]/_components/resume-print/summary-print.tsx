"use client"

import React from "react"
import {SummaryContentType} from "../../_static/type"

type SummaryPrintProps = {
    data: SummaryContentType
}

export default function SummaryPrint({data}: SummaryPrintProps) {
    return (
        <section className="pt-3 w-full relative avoid-break px-2 rounded-xl">
            <h2 className="border-b border-primary text-base font-[600] mb-2">Summary</h2>
            <div className="min-h-fit p-0 text-xs text-justify">{data.text}</div>
        </section>
    )
}
