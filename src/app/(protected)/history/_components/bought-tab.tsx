import React from "react"
import {getPurchaseHistory} from "../actions"
import PaginationComponent from "@/components/custom/pagination"
import {PiNote, PiSpinner} from "react-icons/pi"
import BoughtList from "./bought-list"
import NotFound from "./not-found"

type BoughtTabProps = {
    page?: number
}

export default async function BoughtTab({page}: BoughtTabProps) {
    const res = await getPurchaseHistory(page)

    if (res.error) return <div>{res.error}</div>

    if (res.data) {
        const {data, metadata} = res.data

        return (
            <>
                <div className="flex flex-col flex-1">
                    {data.length > 0 ? <BoughtList data={data} /> : <NotFound icon={<PiNote />} text="No Purchase History Found" />}
                </div>
                <PaginationComponent metadata={metadata} />
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
