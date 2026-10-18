"use client"

import ConfirmationPopover from "@/components/custom/confirmation-popover"
import {Button} from "@/components/ui/button"
import {PiTrash} from "react-icons/pi"

type DrawerDeleteButtonProps = {
    handleConfirm: () => void
    label?: string
    description?: string
}

export default function DrawerDeleteButton({handleConfirm, label = "Delete", description = "This content will be removed from your resume if you continue."}: DrawerDeleteButtonProps) {
    return (
        <div className="mt-4 flex justify-center border-t pt-4">
            <ConfirmationPopover
                button={
                    <Button variant="ghost" size="sm" className="cursor-pointer gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive">
                        <PiTrash /> {label}
                    </Button>
                }
                handleConfirm={handleConfirm}
                description={description}
                title="Are you sure?"
            />
        </div>
    )
}
