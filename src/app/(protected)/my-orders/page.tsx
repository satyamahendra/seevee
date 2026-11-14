import PageHeader from "@/components/custom/page-header/page-header"
import {PiReceipt} from "react-icons/pi"
import AnimDiv from "@/components/custom/anim-div"
import SearchParams from "@/components/custom/search-params"
import {Suspense} from "react"
import {Loader2} from "lucide-react"
import MyOrderList from "./components/my-order-list"

export const metadata = {
    title: "My Orders",
    description: "Your credit purchases",
}

type PageProps = {
    searchParams: Promise<{
        page?: string
        search?: string
    }>
}

export default async function Page({searchParams}: PageProps) {
    const {page, search} = await searchParams
    const pageNum = page ? parseInt(page) || 1 : 1

    return (
        <AnimDiv className="flex flex-col gap-4">
            <PageHeader title="My Orders" description="Your credit purchases" icon={<PiReceipt />} />
            <SearchParams className="w-48 self-end" />
            <Suspense
                key={`${page}-${search}`}
                fallback={
                    <AnimDiv className="flex items-center justify-center h-20">
                        <Loader2 className="animate-spin text-primary" />
                    </AnimDiv>
                }>
                <MyOrderList page={pageNum} search={search} />
            </Suspense>
        </AnimDiv>
    )
}
