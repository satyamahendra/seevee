"use client"

import {useQuery} from "@tanstack/react-query"
import {format} from "date-fns"
import {Loader2} from "lucide-react"
import {PiCalendarDots, PiReceipt, PiSparkle} from "react-icons/pi"
import ListItem from "@/components/custom/item"
import {Badge} from "@/components/ui/badge"
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty"
import {formatIdr, formatUsd} from "@/utils/helpers/format-usd"
import {normalizeString} from "@/utils/helpers/normalize-string"
import {STATUS_VARIANT} from "@/app/(protected)/my-orders/components/my-order-item"
import {getUserActivity} from "../services/get-user-activity"

const iconBox = "mr-3 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg text-muted-foreground"

const Section = ({title, count, children}: {title: string; count: number; children: React.ReactNode}) => (
    <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">
            {title} <span className="font-normal text-muted-foreground">({count})</span>
        </h3>
        {children}
    </section>
)

const Nothing = ({icon, title, description}: {icon: React.ReactNode; title: string; description: string}) => (
    <div className="rounded-xl border border-dashed border-border py-8">
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">{icon}</EmptyMedia>
                <EmptyTitle>{title}</EmptyTitle>
                <EmptyDescription>{description}</EmptyDescription>
            </EmptyHeader>
        </Empty>
    </div>
)

const UserActivityTab = ({userId}: {userId: string}) => {
    const {data, isLoading} = useQuery({queryKey: ["user", userId, "activity"], queryFn: () => getUserActivity(userId)})

    if (isLoading)
        return (
            <div className="flex h-20 items-center justify-center">
                <Loader2 className="animate-spin text-primary" />
            </div>
        )

    if (!data?.success)
        return <Nothing icon={<PiReceipt />} title="Failed to load activity" description={data?.message ?? "Please try again."} />

    const {orders, transactions} = data.data

    return (
        <div className="flex flex-col gap-6">
            <Section title="Orders" count={orders.length}>
                {orders.length === 0 ? (
                    <Nothing icon={<PiReceipt />} title="No orders yet" description="Credit purchases will show up here." />
                ) : (
                    <div className="flex flex-col overflow-hidden rounded-xl border border-border">
                        {orders.map((o) => (
                            <ListItem
                                key={o.id}
                                className="last:border-b-0"
                                media={
                                    <div className={iconBox}>
                                        <PiReceipt />
                                    </div>
                                }
                                title={
                                    <span className="flex items-baseline gap-2 tabular-nums">
                                        {o.usd_cents === null ? formatIdr(o.gross_amount) : formatUsd(o.usd_cents)}
                                        {o.usd_cents !== null && <span className="text-xs font-normal text-muted-foreground">Charged as {formatIdr(o.gross_amount)}</span>}
                                    </span>
                                }
                                description={
                                    <span className="flex items-center gap-1 text-xs">
                                        <PiCalendarDots />
                                        {format(o.created_at, "dd MMM yyyy, HH:mm")}
                                    </span>
                                }
                                actions={<Badge variant={STATUS_VARIANT[o.status]}>{normalizeString(o.status)}</Badge>}
                            />
                        ))}
                    </div>
                )}
            </Section>

            <Section title="Credit usage" count={transactions.length}>
                {transactions.length === 0 ? (
                    <Nothing icon={<PiSparkle />} title="No credits used yet" description="AI actions will show up here." />
                ) : (
                    <div className="flex flex-col overflow-hidden rounded-xl border border-border">
                        {transactions.map((t) => (
                            <ListItem
                                key={t.id}
                                className="last:border-b-0"
                                media={
                                    <div className={iconBox}>
                                        <PiSparkle />
                                    </div>
                                }
                                title={normalizeString(t.actionType)}
                                description={
                                    <span className="flex items-center gap-1 text-xs">
                                        <PiCalendarDots />
                                        {format(t.createdAt, "dd MMM yyyy, HH:mm")}
                                    </span>
                                }
                                actions={<span className="font-medium tabular-nums">-{t.creditsUsed}</span>}
                            />
                        ))}
                    </div>
                )}
            </Section>
        </div>
    )
}

export default UserActivityTab
