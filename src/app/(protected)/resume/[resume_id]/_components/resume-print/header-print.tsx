"use client"

import React from "react"
import {PiEnvelope, PiLink, PiMapPin, PiPhone} from "react-icons/pi"
import {HeaderContentType} from "../../_static/type"
import {linkIcons} from "@/util/constants/linkIcons"

type HeaderPrint = {
    data: HeaderContentType
}

export default function HeaderPrint({data}: HeaderPrint) {
    return (
        <header className="pt-3 text-xs w-full relative border-primary avoid-break flex flex-col items-center justify-center py-1">
            <div className="w-fit px-2 rounded-lg font-semibold group-hover:bg-muted border-none shadow-none outline-none text-lg py-0.5">{data.fullname}</div>
            <ul className="flex flex-col text-muted-foreground text-xs items-center gap-x-4 px-2">
                <li className="flex items-center gap-1">
                    <PiEnvelope className="text-base" />
                    <span className="rounded-md py-0.5">{data.email}</span>
                </li>
                <li className="flex items-center gap-1">
                    <PiPhone className="text-base" />
                    <span className="rounded-md py-0.5">{data.phone}</span>
                </li>
                <li className="flex items-center gap-1">
                    <PiMapPin className="text-base" />
                    <span className="rounded-l-md py-0.5">{data.city}</span>
                    {", "}
                    <span className="rounded-r-md py-0.5">{data.country}</span>
                </li>
            </ul>
            <ul className="flex gap-3">
                {data?.links?.length > 0 &&
                    data.links.map((link, index) => (
                        <li key={index} className="flex items-center">
                            <a href={link.url} className="flex items-center gap-1 text-muted-foreground">
                                {link?.icon ? linkIcons.find((icon) => icon.name === link.icon)?.icon : <PiLink />}
                                <div>{link.name}</div>
                            </a>
                        </li>
                    ))}
            </ul>
        </header>
    )
}
