"use client"

import {cloneElement, useState} from "react"
import {Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import {useScreenSize} from "@/utils/hooks/useScreenSize"

type ResumeDrawerProps = {
    trigger: React.ReactElement
    title?: React.ReactNode
    description?: React.ReactNode
    children: React.ReactNode
}

export default function ResumeDrawer({trigger, title, description, children}: ResumeDrawerProps) {
    const {isMobile} = useScreenSize()
    const [open, setOpen] = useState(false)

    const triggerWithClick = cloneElement(trigger as React.ReactElement<{onClick?: () => void}>, {onClick: () => setOpen(true)})

    return (
        <>
            {triggerWithClick}
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