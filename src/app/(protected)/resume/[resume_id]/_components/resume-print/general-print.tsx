"use client"

import React from "react"
import {PiCircleFill} from "react-icons/pi"
import {GeneralContentType} from "../../_static/type"
import {format, isValid} from "date-fns"

type GeneralPrintProps = {
    data: GeneralContentType
}

export default function GeneralPrint({data}: GeneralPrintProps) {
    return (
        <>
            <h2 className="mb-1.5 pt-3 w-full">
                <div className="w-fit px-2 text-base rounded-lg font-[600] py-0.5">{data.title}</div>
                <div className="border-b border-primary mx-2"></div>
            </h2>

            {data?.general?.length > 0 &&
                data.general.map((gen, genIndex) => {
                    return (
                        <div key={genIndex} className="relative w-full pr-2 rounded-lg avoid-break pt-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="px-2 rounded-lg font-[500] text-sm">{gen.title}</div>
                                    {gen?.links?.length > 0 &&
                                        gen.links.map((link, linkIndex) => {
                                            return (
                                                <div key={linkIndex} className="flex text-blue-400 text-xs font-semibold ml-3 items-center gap-2">
                                                    <a href={link.url} className="hover:underline">
                                                        {link.name}
                                                    </a>
                                                </div>
                                            )
                                        })}
                                </div>
                                <div className="text-muted-foreground text-xs flex">
                                    <span>{gen.startDate && isValid(new Date(gen.startDate)) ? format(new Date(gen.startDate), "MMM, yyyy") : "Present"}</span>
                                    <div className="mx-1">-</div>
                                    <span>{gen.endDate && isValid(new Date(gen.endDate)) ? format(new Date(gen.endDate), "MMM, yyyy") : "Present"}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <div className="px-2 text-muted-foreground italic">{gen.subtitle}</div>
                                <div className="flex items-center text-muted-foreground">
                                    <span className="rounded-l-md pl-2 py-0.5">{gen.city}</span>
                                    {", "}
                                    <span className="rounded-r-md ml-1 py-0.5">{gen.country}</span>
                                </div>
                            </div>

                            {gen?.bulletpoints?.length > 0 &&
                                gen.bulletpoints.map((bp, bpIndex) => {
                                    return (
                                        <div key={bpIndex} className="flex flex-col px-2">
                                            <div className="flex relative ml-1">
                                                <div className="mt-2">
                                                    <PiCircleFill size={4} />
                                                </div>
                                                <div className="text-xs ml-1">{bp}</div>
                                            </div>
                                        </div>
                                    )
                                })}

                            {gen?.tags?.length > 0 && gen?.tags?.length > 0 && (
                                <div className="px-2 pb-2">
                                    <div className="flex text-xs flex-wrap items-center gap-1 mt-1">
                                        {gen.tags.map((tag, tagIndex) => {
                                            return (
                                                <span key={tagIndex} className="px-2 border bg-muted rounded-md">
                                                    {tag}
                                                </span>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
        </>
    )
}
