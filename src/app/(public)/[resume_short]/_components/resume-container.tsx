import React from "react"
import {ContentStateType} from "@/app/(protected)/resume/[resume_id]/_static/type"
import {getResumeByHash} from "../actions"
import ResumeDisplay from "./resume-display"
import {PiX} from "react-icons/pi"
import Link from "next/link"
import {Button} from "@/components/ui/button"

type ResumeContainerProps = {
    resumeHash: string
}

export default async function ResumeContainer({resumeHash}: ResumeContainerProps) {
    let content: ContentStateType[] | null = null
    let errorMessage: string | null = null

    try {
        const res = await getResumeByHash(resumeHash)
        content = res.data.data as ContentStateType[]
    } catch (error) {
        errorMessage = error instanceof Error ? error.message : "Something went wrong"
    }

    if (content) return <ResumeDisplay content={content} />

    return (
        <div className="flex items-center text-muted-foreground justify-center flex-col mt-8 gap-2">
            <PiX />
            {errorMessage}
            <Link href="/" className="mt-4">
                <Button className="text-xs h-8">Home</Button>
            </Link>
        </div>
    )
}