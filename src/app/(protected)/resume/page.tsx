import React from "react"
import {getResume} from "./action"
import ResumesContainer from "./_components/resumes-container"
import TyModal from "@/components/custom/ty-modal"

type PageProps = {
    searchParams: Promise<{is_ty: string}>
}

export default async function Page({searchParams}: PageProps) {
    const response = await getResume()
    const {is_ty} = (await searchParams) || {}

    if (response.error)
        return (
            <>
                <h1 className="text-xl font-semibold">Resume</h1>
                <p className="text-muted-foreground text-sm">Your collection of resumes</p>

                <div className="mt-8 text-center">{response.error}</div>
            </>
        )

    if (response.data) {
        return (
            <>
                <ResumesContainer resumes={response.data} />
                <TyModal isDialogOpen={is_ty === "true"} />
            </>
        )
    }
}
