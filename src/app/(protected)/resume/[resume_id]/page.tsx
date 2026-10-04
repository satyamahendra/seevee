import React from "react"
import {getResumeById} from "./action"
import ResumeContainer from "./_components/resume-container"
import {ContentStateType} from "./_static/type"
import {Metadata} from "next"

export const metadata: Metadata = {
    title: "Seevee | Resume",
    description: "Create, edit and manage your resume",
}

type PageProps = {
    params: Promise<{resume_id: string}>
}

export default async function Page({params}: PageProps) {
    const {resume_id} = await params

    const resume = await getResumeById(resume_id)

    if (resume.error) return <div>Something went wrong...</div>

    if (resume.data) return <ResumeContainer resumeId={resume_id} resume={resume.data.data as ContentStateType[]} resumeData={resume.data} />

    return <div>Loading...</div>
}
