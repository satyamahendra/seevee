import React from "react"
import UsedTab from "./_components/used-tab"
import BoughtTab from "./_components/bought-tab"
import {PiSpinner} from "react-icons/pi"

type PageProps = {
    searchParams?: Promise<{type: "used" | "bought"; page?: number}>
}

export const metadata = {
    title: "Seevee | History",
    description: "Your transaction and purchase history",
}

export default async function Page({searchParams}: PageProps) {
    const {type, page} = (await searchParams) || {}

    if (type === "used") return <UsedTab page={page} />

    if (type === "bought") return <BoughtTab page={page} />

    return (
        <div className="flex flex-col flex-1 justify-center items-center text-sm text-muted-foreground gap-4">
            <div className="flex items-center gap-2">
                <PiSpinner className="animate-spin text-2xl" />
                loading...
            </div>
        </div>
    )
}
