import React from "react"
import {getCreditTransactions} from "../actions"
import Pagination from "@/components/custom/pagination"
import {PiNote, PiSpinner} from "react-icons/pi"
import UsedList from "./used-list"
import NotFound from "./not-found"

type UsedTabProps = {
    page?: number
}

export default async function UsedTab({page}: UsedTabProps) {
    const res = await getCreditTransactions(page)

    if (res.error) return <div>{res.error}</div>

    if (res.data) {
        const {data, metadata} = res.data

        return (
            <>
                <div className="flex flex-col flex-1">
                    {data.length > 0 ? <UsedList data={data} /> : <NotFound icon={<PiNote />} text="No Transaction History Found" />}
                </div>
                <Pagination metadata={metadata} />
            </>
        )
    }

    return (
        <div className="flex flex-col flex-1 justify-center items-center text-sm text-muted-foreground gap-4">
            <div className="flex items-center gap-2">
                <PiSpinner className="animate-spin text-2xl" />
                loading...
            </div>
        </div>
    )
}
