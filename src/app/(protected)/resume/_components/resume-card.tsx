"use client"

import React from "react"
import type {ResumeRow} from "../action"
import {ContentStateType} from "../[resume_id]/_static/type"
import Link from "next/link"
import {format} from "date-fns"

type ResumeCardProps = {
    resume: ResumeRow
}

export default function ResumeCard({resume}: ResumeCardProps) {
    const content = resume.data as ContentStateType[]

    const headerContent = content.find((con) => con.type === "header")
    const generalContents = content.filter((con) => con.type === "general")
    const firstThreeGeneralContents = generalContents.slice(0, 3)
    const restGeneralContents = generalContents.slice(3)

    return (
        <Link
            href={`/resume/${resume.id}`}
            className=" flex border duration-200 hover:scale-[101%] hover:border-muted-foreground flex-col justify-between bg-primary-foreground aspect-square rounded-xl p-4">
            <div className="text-sm">
                <div className="font-[500]">{headerContent?.fullname}</div>
                <div className="text-xs text-muted-foreground">{resume.createdAt ? format(new Date(resume.createdAt), "d MMMM yyyy") : ""}</div>
            </div>
            <ul className="flex flex-col gap-2 mt-auto text-xs text-muted-foreground">
                {firstThreeGeneralContents.map((con, conIndex) => (
                    <li key={conIndex} className="flex gap-2 items-center">
                        <div className="w-5 h-5 flex items-center rounded-md border bg-muted justify-center">{con.general.length}</div>
                        <div>{con.title}</div>
                    </li>
                ))}
                {restGeneralContents.length > 0 && (
                    <li className="flex gap-2 justify-end">
                        <div>. . . and {restGeneralContents.length} more</div>
                    </li>
                )}
            </ul>
        </Link>
    )
}
