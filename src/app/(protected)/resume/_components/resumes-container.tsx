import React from "react"
import CreateResumeCard from "./create-resume-card"
import ResumeCard from "./resume-card"
import AnimatedContainer from "@/components/custom/animated-container"
import type {ResumeRow} from "../action"

type ResumeContainerProps = {
    resumes: ResumeRow[]
}

export default function ResumesContainer({resumes}: ResumeContainerProps) {
    return (
        <AnimatedContainer>
            <h1 className="text-xl font-semibold">Resume</h1>
            <p className="text-muted-foreground text-sm">Your collection of resumes</p>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <CreateResumeCard />
                {resumes.map((resume, index) => (
                    <ResumeCard key={index} resume={resume} />
                ))}
            </div>
        </AnimatedContainer>
    )
}
