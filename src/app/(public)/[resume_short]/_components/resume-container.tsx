import React from "react"
import {ContentStateType} from "@/app/(protected)/resume/[resume_id]/_static/type"
import {getResumeByHash} from "../actions"
import ResumeDisplay from "./resume-display"
import {notFound} from "next/navigation"

type ResumeContainerProps = {
    resumeHash: string
}

export default async function ResumeContainer({resumeHash}: ResumeContainerProps) {
    let content: ContentStateType[] | null = null

    try {
        const res = await getResumeByHash(resumeHash)
        content = res.data.data as ContentStateType[]
    } catch {
        // Invalid short id, missing or private resume: all look the same, so private resumes are not revealed.
        notFound()
    }

    return <ResumeDisplay content={content} />
}