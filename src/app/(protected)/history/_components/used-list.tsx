"use client"

import {format} from "date-fns"
import {useState} from "react"
import {PiBracketsCurly, PiCalendarDots, PiSparkle} from "react-icons/pi"
import {Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import {Button} from "@/components/ui/button"
import ListItem from "@/components/custom/item"
import {copyToClipboard} from "@/utils/helpers/copyToClipboard"
import {normalizeString} from "@/utils/helpers/normalize-string"
import {useScreenSize} from "@/utils/hooks/useScreenSize"
import {toast} from "sonner"
import type {CreditTransactionRow} from "../_actions/get-credit-transactions"

type UsedListProps = {
    data: CreditTransactionRow[]
}

const credits = (n: number) => `-${n} ${n === 1 ? "credit" : "credits"}`

export default function UsedList({data}: UsedListProps) {
    const {isMobile} = useScreenSize()
    const [selected, setSelected] = useState<CreditTransactionRow | null>(null)

    const handleCopy = () => {
        copyToClipboard(JSON.stringify(selected?.result ?? null, null, 2))
        toast("JSON copied to clipboard")
    }

    return (
        <>
            <div className="flex flex-col overflow-hidden rounded-xl border border-border">
                {data.map((ct) => (
                    <ListItem
                        key={ct.id}
                        className="last:border-b-0"
                        media={
                            <div className="mr-3 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg text-muted-foreground">
                                <PiSparkle />
                            </div>
                        }
                        title={normalizeString(ct.actionType)}
                        description={
                            <span className="flex items-center gap-1 text-xs">
                                <PiCalendarDots />
                                {format(ct.createdAt, "dd MMM yyyy, HH:mm")}
                            </span>
                        }
                        actions={
                            <>
                                <span className="font-medium tabular-nums">{credits(ct.creditsUsed)}</span>
                                {ct.result != null && (
                                    <Button aria-label="View result" className="rounded-lg" onClick={() => setSelected(ct)} size="icon-sm" variant="ghost">
                                        <PiBracketsCurly />
                                    </Button>
                                )}
                            </>
                        }
                    />
                ))}
            </div>

            <Drawer swipeDirection={isMobile ? "down" : "right"} open={Boolean(selected)} onOpenChange={(next) => !next && setSelected(null)}>
                <DrawerContent className="[--drawer-content-width:min(100dvw,44rem)]">
                    <DrawerHeader className="flex flex-col items-center text-center">
                        <DrawerTitle>{selected ? normalizeString(selected.actionType) : "Transaction"}</DrawerTitle>
                        <DrawerDescription>
                            {selected ? `${format(selected.createdAt, "dd MMM yyyy, HH:mm")}, ${credits(selected.creditsUsed)}` : ""}
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1 overflow-auto p-4">
                        <pre className="w-full overflow-auto rounded-lg border bg-muted/40 p-3 text-[11px] leading-relaxed">
                            {selected ? JSON.stringify(selected.result, null, 2) : ""}
                        </pre>
                    </div>
                    <DrawerFooter>
                        <Button onClick={handleCopy} className="w-full">
                            Copy JSON
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    )
}
