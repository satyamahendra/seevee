import React, {Suspense} from "react"
import {getResumeByHash} from "./actions"
import {ContentStateType, HeaderContentType} from "@/app/(protected)/resume/[resume_id]/_static/type"
import ResumeContainer from "./_components/resume-container"
import Link from "next/link"
import {PiCircleDashed} from "react-icons/pi"

type PageProps = {
    params: Promise<{resume_short: string}>
}

export async function generateMetadata({params}: PageProps) {
    const {resume_short} = await params
    try {
        const res = await getResumeByHash(resume_short)
        const resume = res.data.data as ContentStateType[]
        const header = resume.find((con) => con.type === "header") as HeaderContentType
        return {
            title: `Seevee | ${header.fullname}'s Resume`,
            description: `${header.fullname}'s Resume, ${header.email}, ${header.phone}, living in ${header.city}, ${header.country}`,
        }
    } catch (error) {
        return {
            title: "Seevee | Resume Not Found",
            description: `Resume not found, ${error || "Something went wrong"}`,
        }
    }
}

export default async function Page({params}: PageProps) {
    const {resume_short} = await params
    return (
        <div className="flex flex-col items-center h-full justify-center bg-muted p-4 gap-4">
            <Link href="/" className="flex items-center gap-2 text-xl">
                <div className="w-4 h-4 bg-primary rotate-45 rounded-sm"></div>Seevee
            </Link>
            <Suspense
                fallback={
                    <div className="flex items-center text-muted-foreground justify-center">
                        <PiCircleDashed className="animate-spin text-4xl" />
                    </div>
                }>
                <ResumeContainer resumeHash={resume_short} />
            </Suspense>
        </div>
    )
}
