import PageHeader from "@/components/custom/page-header/page-header"
import {PiTicket} from "react-icons/pi"
import {hasPermissions} from "@/utils/helpers/has-ability-server"
import {redirect} from "next/navigation"
import AnimDiv from "@/components/custom/anim-div"
import SearchParams from "@/components/custom/search-params"
import {Suspense} from "react"
import {Loader2} from "lucide-react"
import OrderList from "./components/order-list"
import OrderDetailDrawer from "./components/order-detail-drawer"

type PageProps = {
    searchParams: Promise<{
        page?: string
        search?: string
    }>
}

const Page = async ({searchParams}: PageProps) => {
    const hasPerm = await hasPermissions(["read orders", "manage orders"])
    if (!hasPerm) return redirect("/resume")

    const {page, search} = await searchParams
    const pageNum = page ? parseInt(page) : 1

    return (
        <AnimDiv className="flex flex-col gap-4">
            <PageHeader title="Orders" description="Manage orders" icon={<PiTicket />} />
            <OrderDetailDrawer />
            <SearchParams className="w-48 self-end" />
            <Suspense
                key={`${page}-${search}`}
                fallback={
                    <AnimDiv className="flex items-center justify-center h-20">
                        <span className="text-muted-foreground">
                            <Loader2 className="animate-spin text-primary" />
                        </span>
                    </AnimDiv>
                }>
                <OrderList page={pageNum} search={search} />
            </Suspense>
        </AnimDiv>
    )
}

export default Page
