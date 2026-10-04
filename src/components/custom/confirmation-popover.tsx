"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {PiWarningCircle} from "react-icons/pi"
import {Tooltip, TooltipContent, TooltipTrigger} from "../ui/tooltip"

type ConfirmationPopoverProps = {
    button: React.ReactElement
    title?: string
    description?: string
    side?: "top" | "right" | "bottom" | "left"
    handleConfirm: () => void
    tooltip?: React.ReactNode
}

export default function ConfirmationPopover({
    button,
    title = "Are you sure?",
    description = "Are you sure you are going to do this?",
    handleConfirm,
    tooltip,
}: ConfirmationPopoverProps) {
    return (
        <AlertDialog>
            {tooltip ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
            ) : (
                <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
            )}
            <AlertDialogContent>
                <AlertDialogHeader className="space-y-2">
                    <AlertDialogTitle className="flex flex-col justify-center items-center w-full gap-2">
                        <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center">
                            <PiWarningCircle className="text-muted-foreground text-xl" />
                        </div>
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center">{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex justify-center gap-2">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm}>Yes</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
