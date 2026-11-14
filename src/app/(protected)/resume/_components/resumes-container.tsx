import React from "react"
import CreateResumeCard from "./create-resume-card"
import ResumeCard from "./resume-card"
import {MAX_RESUMES} from "@/utils/constants/resume"
import type {ResumeRow} from "../action"

type ResumeContainerProps = {
    resumes: ResumeRow[]
}

export default function ResumesContainer({resumes}: ResumeContainerProps) {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <CreateResumeCard full={resumes.length >= MAX_RESUMES} />
            {resumes.map((resume) => (
                <ResumeCard key={resume.id} resume={resume} />
            ))}
        </div>
    )
}
