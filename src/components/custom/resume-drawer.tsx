"use client"

import {cloneElement, useState} from "react"
import {Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import {useScreenSize} from "@/utils/hooks/useScreenSize"
import {Tooltip, TooltipContent, TooltipTrigger} from "../ui/tooltip"

type ResumeDrawerProps = {
    trigger: React.ReactElement
    title?: React.ReactNode
    description?: React.ReactNode
    children: React.ReactNode
    tooltip?: React.ReactNode
}

export default function ResumeDrawer({trigger, title, description, children, tooltip}: ResumeDrawerProps) {
    const {isMobile} = useScreenSize()
    const [open, setOpen] = useState(false)

    const triggerWithClick = cloneElement(trigger as React.ReactElement<{onClick?: () => void}>, {onClick: () => setOpen(true)})

    return (
        <>
            {tooltip ? (
                <Tooltip>
                    <TooltipTrigger asChild>{triggerWithClick}</TooltipTrigger>
                    <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
            ) : (
                triggerWithClick
            )}
            <Drawer swipeDirection={isMobile ? "down" : "left"} open={open} onOpenChange={setOpen}>
                <DrawerContent className="[--drawer-content-width:min(100dvw,32rem)]">
                    <DrawerHeader className="text-left">
                        {title && <DrawerTitle>{title}</DrawerTitle>}
                        {description && <DrawerDescription>{description}</DrawerDescription>}
                    </DrawerHeader>
                    <div className="flex-1 overflow-y-auto p-4 pt-2">{children}</div>
                </DrawerContent>
            </Drawer>
        </>
    )
}
