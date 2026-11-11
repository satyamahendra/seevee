"use client"

import {cn} from "@/lib/utils"

type ListItemProps = Omit<React.ComponentProps<"div">, "title"> & {
    media?: React.ReactNode
    title?: React.ReactNode
    description?: React.ReactNode
    actions?: React.ReactNode
}

const ListItem = ({media, title, description, actions, className, ...props}: ListItemProps) => {
    return (
        <div className={cn("w-full border-b border-border/60", className)} {...props}>
            <div className="group/item flex w-full flex-wrap items-center rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/40">
                {media}

                {(title || description) && (
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                        {title && <div className="line-clamp-1 font-medium">{title}</div>}
                        {description && <div className="text-sm text-muted-foreground">{description}</div>}
                    </div>
                )}

                {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
            </div>
        </div>
    )
}

export default ListItem