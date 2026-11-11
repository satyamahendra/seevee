import React, {Suspense} from "react"
import {getResumeByHash} from "./actions"
import {ContentStateType, HeaderContentType, SummaryContentType} from "@/app/(protected)/resume/[resume_id]/_static/type"
import ResumeContainer from "./_components/resume-container"
import Link from "next/link"
import type {Metadata} from "next"
import {PiCircleDashed} from "react-icons/pi"

type PageProps = {
    params: Promise<{resume_short: string}>
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
    const {resume_short} = await params
    try {
        const res = await getResumeByHash(resume_short)
        const resume = res.data.data as ContentStateType[]
        const header = resume.find((con) => con.type === "header") as HeaderContentType
        const summary = resume.find((con) => con.type === "summary") as SummaryContentType | undefined
        const title = `${header.fullname}'s Resume`
        // No email or phone here: search engines show this text in results.
        const location = [header.city, header.country].filter(Boolean).join(", ")
        const description = (summary?.text?.trim() || `${title}${location ? `, based in ${location}` : ""}. Built with seevee.`).slice(0, 160)
        return {
            title,
            description,
            alternates: {canonical: `/${resume_short}`},
            openGraph: {type: "profile", title, description, url: `/${resume_short}`},
            // The owner can open their own private resume here; never let that version be indexed.
            robots: res.data.isPublic ? undefined : {index: false, follow: false},
        }
    } catch {
        return {title: "Page not found", robots: {index: false, follow: false}}
    }
}

export default async function Page({params}: PageProps) {
    const {resume_short} = await params
    return (
        <div className="flex h-dvh flex-col items-center gap-4 overflow-hidden bg-muted px-4 py-6 sm:px-8">
            <Link href="/" className="flex shrink-0 items-center gap-2 text-xl">
                <div className="w-3 h-3 bg-linear-to-br from-brand to-brand-2 rotate-45 rounded-xs tracking-tighter"></div>seevee
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
