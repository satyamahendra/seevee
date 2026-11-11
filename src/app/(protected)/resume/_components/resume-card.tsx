import React from "react"
import type {ResumeRow} from "../action"
import {ContentStateType} from "../[resume_id]/_static/type"
import Link from "next/link"
import {format} from "date-fns"

type ResumeCardProps = {
    resume: ResumeRow
}

export default function ResumeCard({resume}: ResumeCardProps) {
    const content = (resume.data as ContentStateType[]) ?? []

    const headerContent = content.find((con) => con.type === "header")
    const generalContents = content.filter((con) => con.type === "general")
    const firstThreeGeneralContents = generalContents.slice(0, 3)
    const restCount = generalContents.length - firstThreeGeneralContents.length

    return (
        <Link
            href={`/resume/${resume.id}`}
            className="flex aspect-square flex-col justify-between rounded-xl border bg-card p-4 transition-colors hover:border-muted-foreground">
            <div className="flex min-w-0 flex-col gap-0.5 text-sm">
                <div className="truncate font-medium">{headerContent?.fullname || "Untitled resume"}</div>
                <div className="text-xs text-muted-foreground">{format(new Date(resume.createdAt), "d MMMM yyyy")}</div>
            </div>
            <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
                {firstThreeGeneralContents.map((con, conIndex) => (
                    <li key={conIndex} className="flex min-w-0 items-center gap-2">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border bg-muted">{con.general.length}</div>
                        <div className="truncate">{con.title}</div>
                    </li>
                ))}
                {restCount > 0 && <li className="text-end">and {restCount} more</li>}
            </ul>
        </Link>
    )
}
