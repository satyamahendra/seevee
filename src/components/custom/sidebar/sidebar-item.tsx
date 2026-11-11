"use client"

import Link from "next/link"
import {usePathname} from "next/navigation"
import {useState, useEffect} from "react"
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {cn} from "@/lib/utils"
import {hasAccess, MenuItem} from "@/utils/constants/sidebar"
import {PiCaretDown} from "react-icons/pi"

type SidebarItemProps = {
    menu: MenuItem
    userPermissions: string[]
    userRoles: string[]
    horizontal?: boolean
}

const SidebarItem = ({menu, userPermissions, userRoles, horizontal = false}: SidebarItemProps) => {
    const pathname = usePathname()

    const accessibleChildren = menu.children.filter((child) => hasAccess(child, userPermissions, userRoles))

    const hasChildren = accessibleChildren.length > 0
    const isActive = pathname === menu.href || (menu.href !== "/" && menu.href !== "" && pathname.startsWith(menu.href + "/"))
    const isChildActive = accessibleChildren.some(
        (child) => pathname === child.href || (child.href !== "/" && child.href !== "" && pathname.startsWith(child.href + "/")),
    )

    const [open, setOpen] = useState(!horizontal && isChildActive)

    useEffect(() => {
        // dropdown closes on navigation; vertical collapsible auto-opens on its active group
        if (horizontal) setOpen(false)
        else if (isChildActive) setOpen(true)
    }, [pathname, isChildActive, horizontal])

    const linkClass = horizontal
        ? cn(
              "flex items-center px-4 py-3 text-sm transition-colors text-muted-foreground border-b-2 border-transparent",
              "hover:text-foreground",
              (isActive || isChildActive) && "border-primary text-foreground",
          )
        : cn(
              "flex items-center rounded-md px-2 py-1.5 text-sm transition-colors text-muted-foreground",
              "hover:bg-muted hover:text-accent-foreground",
              isActive && "bg-muted text-accent-foreground",
          )

    if (!hasChildren) {
        return (
            <li>
                <Link href={menu.href} className={linkClass}>
                    {menu.icon && <span className={cn("text-lg shrink-0 flex items-center justify-center", horizontal ? "mr-1.5" : "mr-3")}>{menu.icon}</span>}
                    <span className="whitespace-nowrap overflow-hidden">{menu.label}</span>
                </Link>
            </li>
        )
    }

    if (menu.groupType === "labelled") {
        return (
            <li>
                <div className={cn(linkClass, "text-muted-foreground pointer-events-none")}>
                    {menu.icon && <span className={cn("text-lg shrink-0 flex items-center justify-center", horizontal ? "mr-1.5" : "mr-3")}>{menu.icon}</span>}
                    <span className="whitespace-nowrap overflow-hidden">{menu.label}</span>
                </div>
                <ul className="mt-1 flex flex-col gap-1 pl-6">
                    {accessibleChildren.map((child) => (
                        <SidebarItem key={child.label} menu={child} userPermissions={userPermissions} userRoles={userRoles} />
                    ))}
                </ul>
            </li>
        )
    }

    const groupLabel = (
        <>
            <span className="flex items-center">
                {menu.icon && <span className={cn("text-lg shrink-0 flex items-center justify-center", horizontal ? "mr-1.5" : "mr-3")}>{menu.icon}</span>}
                <span className="whitespace-nowrap overflow-hidden">{menu.label}</span>
            </span>
            <PiCaretDown className={cn("shrink-0 ml-auto transition-transform duration-300", open ? "rotate-180" : "rotate-0")} />
        </>
    )

    if (horizontal) {
        return (
            <li>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <button className={cn(linkClass, "gap-2 cursor-pointer")}>{groupLabel}</button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-48 p-1 gap-0">
                        <ul className="flex flex-col gap-1">
                            {accessibleChildren.map((child) => (
                                <SidebarItem key={child.label} menu={child} userPermissions={userPermissions} userRoles={userRoles} />
                            ))}
                        </ul>
                    </PopoverContent>
                </Popover>
            </li>
        )
    }

    return (
        <li>
            <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger asChild>
                    <button className={cn(linkClass, "w-full justify-between", isChildActive && "text-accent-foreground")}>{groupLabel}</button>
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <ul className="mt-1 flex flex-col gap-1 border-l pl-2 ml-4">
                        {accessibleChildren.map((child) => (
                            <SidebarItem key={child.label} menu={child} userPermissions={userPermissions} userRoles={userRoles} />
                        ))}
                    </ul>
                </CollapsibleContent>
            </Collapsible>
        </li>
    )
}

export default SidebarItem