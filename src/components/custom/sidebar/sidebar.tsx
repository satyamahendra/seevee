"use client"

import {hasAccess, menuItems} from "@/utils/constants/sidebar"
import SidebarItem from "./sidebar-item"
import {authClient} from "@/lib/auth-client"
import {useEffect, useState} from "react"
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {PiList} from "react-icons/pi"
import {useScreenSize} from "@/utils/hooks/useScreenSize"
import {Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger} from "@/components/ui/drawer"
import {usePathname} from "next/navigation"

const Sidebar = () => {
    const {data: session} = authClient.useSession()
    const url = usePathname()
    const {isMobile} = useScreenSize()
    const [isOpen, setIsOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    const userPermissions = session?.user?.permissions ?? []
    const userRoles = session?.user?.roles ?? []

    useEffect(() => {
        if (isMobile) {
            setIsOpen(false)
        }
    }, [isMobile, url])

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return

    return (
        <>
            {!isMobile ? (
                <aside className={cn("top-0 p-6 left-0 transition-all duration-300 ease-in-out w-52")}>
                    <div className=" rounded-lg h-full flex flex-col overflow-hidden">
                        <ul className="flex flex-col gap-1">
                            {menuItems
                                .filter((menu) => hasAccess(menu, userPermissions, userRoles))
                                .map((menu) => (
                                    <SidebarItem key={menu.label} menu={menu} userPermissions={userPermissions} userRoles={userRoles} />
                                ))}
                        </ul>
                    </div>
                </aside>
            ) : (
                <Drawer swipeDirection={"up"} open={isOpen} onOpenChange={() => setIsOpen((prev) => !prev)}>
                    <DrawerTrigger
                        className="fixed top-1 left-4"
                        render={
                            <Button variant={"secondary"} className="rounded-lg cursor-pointer" size="icon-lg">
                                <PiList />
                            </Button>
                        }></DrawerTrigger>
                    <DrawerContent aria-describedby="permission-form" className="">
                        <DrawerHeader>
                            <DrawerTitle className="flex items-center gap-4">Seevee</DrawerTitle>
                            <DrawerDescription className="flex items-center gap-4">Welcome to seevee</DrawerDescription>
                        </DrawerHeader>
                        <div className="flex-1 overflow-y-auto">
                            <ul className="flex flex-col gap-1 p-4">
                                {menuItems
                                    .filter((menu) => hasAccess(menu, userPermissions, userRoles))
                                    .map((menu) => (
                                        <SidebarItem key={menu.label} menu={menu} userPermissions={userPermissions} userRoles={userRoles} />
                                    ))}
                            </ul>
                        </div>
                    </DrawerContent>
                </Drawer>
            )}
        </>
    )
}

export default Sidebar
