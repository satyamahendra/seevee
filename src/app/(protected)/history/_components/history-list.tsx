import {PiTicket} from "react-icons/pi"
import {getCreditTransactions} from "../_actions/get-credit-transactions"
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty"
import PaginationParams from "@/components/custom/pagination-params"
import AnimDiv from "@/components/custom/anim-div"
import UsedList from "./used-list"

type UsedTabProps = {
    page?: number
}

export default async function HistoryList({page}: UsedTabProps) {
    const data = await getCreditTransactions(page)

    if (!data.success) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <PiTicket />
                    </EmptyMedia>
                    <EmptyTitle>Something Went Wrong</EmptyTitle>
                    <EmptyDescription>{data.message}, Please try again later.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <AnimDiv className="flex flex-col gap-4">
            {data.data.transactions.length > 0 ? (
                <UsedList data={data.data.transactions} />
            ) : (
                <div className="rounded-xl border border-dashed border-border py-12">
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <PiTicket />
                            </EmptyMedia>
                            <EmptyTitle>No Credits Used Yet</EmptyTitle>
                            <EmptyDescription>Credits you spend on AI actions will show up here</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </div>
            )}
            <div className="ml-auto">
                <PaginationParams className="w-fit" pageCount={data.data.pagination.pageCount || 1} />
            </div>
        </AnimDiv>
    )
}
