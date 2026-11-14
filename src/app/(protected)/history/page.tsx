import React, {Suspense} from "react"
import AnimDiv from "@/components/custom/anim-div"
import {Loader2} from "lucide-react"
import HistoryList from "./_components/history-list"
import {PiTicket} from "react-icons/pi"
import PageHeader from "@/components/custom/page-header/page-header"

type PageProps = {
    searchParams: Promise<{page?: string}>
}

export const metadata = {
    title: "History",
    description: "Your credits usage history",
}

export default async function Page({searchParams}: PageProps) {
    const {page} = await searchParams
    const pageNum = page ? parseInt(page) || 1 : 1

    return (
        <AnimDiv className="flex flex-col gap-4">
            <PageHeader title="History" description="Your credits usage history" icon={<PiTicket />} />
            <Suspense
                key={`${page}`}
                fallback={
                    <AnimDiv className="flex items-center justify-center h-20">
                        <span className="text-muted-foreground">
                            <Loader2 className="animate-spin text-primary" />
                        </span>
                    </AnimDiv>
                }>
                <HistoryList page={pageNum} />
            </Suspense>
        </AnimDiv>
    )
}
