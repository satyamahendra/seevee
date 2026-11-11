import React from "react"
import {getResume} from "./action"
import ResumesContainer from "./_components/resumes-container"
import TyModal from "@/components/custom/ty-modal"
import PageHeader from "@/components/custom/page-header/page-header"
import AnimDiv from "@/components/custom/anim-div"
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty"
import {PiFileText} from "react-icons/pi"

type PageProps = {
    searchParams: Promise<{is_ty?: string}>
}

export default async function Page({searchParams}: PageProps) {
    const response = await getResume()
    const {is_ty} = await searchParams

    return (
        <AnimDiv className="flex flex-col gap-4">
            <PageHeader title="Resume" description="Your collection of resumes" icon={<PiFileText />} />
            {response.data ? (
                <ResumesContainer resumes={response.data} />
            ) : (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <PiFileText />
                        </EmptyMedia>
                        <EmptyTitle>Something Went Wrong</EmptyTitle>
                        <EmptyDescription>{response.error}, Please try again later.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}
            <TyModal isDialogOpen={is_ty === "true"} />
        </AnimDiv>
    )
}
