import {Button} from "@/components/ui/button"
import {Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import {Textarea} from "@/components/ui/textarea"
import React, {useState} from "react"
import {ContentStatesType, ContentStateType} from "../_static/type"
import {copyToClipboard} from "@/utils/helpers/copyToClipboard"
import {toast} from "sonner"
import {PiBoxArrowDown, PiBoxArrowUp} from "react-icons/pi"
import {useScreenSize} from "@/utils/hooks/useScreenSize"
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip"

type AiButtonProps = {
    contentStates: ContentStatesType
    className?: string
    variant?: "ghost" | "outline"
}

export default function JsonButton({contentStates, className, variant = "ghost"}: AiButtonProps) {
    const {isMobile} = useScreenSize()
    const {content, setContent} = contentStates

    const [jsonFormat, setJsonFormat] = useState<ContentStateType[] | string>("")
    const [open, setOpen] = useState<boolean>(false)

    const handleOpenModal = async () => {
        setOpen((prev) => !prev)
        setJsonFormat("")
    }

    const handleSaveJson = () => {
        try {
            const parsed = JSON.parse(jsonFormat as string)

            if (!Array.isArray(parsed)) {
                toast.error("JSON must be an array of objects")
                return
            }

            setContent(parsed as ContentStateType[])
            toast.success("Resume imported successfully!")
            setOpen(false)
        } catch {
            toast.error("Invalid JSON format")
        }
    }

    const handleExport = () => {
        copyToClipboard(JSON.stringify(content))
        toast(<div className="flex items-center gap-2 ">JSON has been copied to clipboard!</div>)
    }

    return (
        <>
            <div className={isMobile ? "flex w-full gap-2" : "contents"}>
                <Button
                    size={"sm"}
                    onClick={handleOpenModal}
                    variant={variant}
                    className={isMobile ? "flex flex-1 justify-center gap-2 h-11 text-sm" : "cursor-pointer flex justify-start gap-2 text-xs"}>
                    <PiBoxArrowDown />
                    Import JSON
                </Button>

                <Button
                    size={"sm"}
                    onClick={handleExport}
                    variant={variant}
                    className={isMobile ? "flex flex-1 justify-center gap-2 h-11 text-sm" : "cursor-pointer flex justify-start gap-2 text-xs"}>
                    <PiBoxArrowUp />
                    Export JSON
                </Button>
            </div>

            <Drawer swipeDirection={isMobile ? "down" : "left"} open={open} onOpenChange={setOpen}>
                <DrawerContent className="[--drawer-content-width:min(100dvw,48rem)]">
                    <DrawerHeader className="flex flex-col items-center text-center">
                        <DrawerTitle className="flex flex-col items-center gap-4">Import Resume</DrawerTitle>
                        <DrawerDescription>Import your resume from JSON format.</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 w-full">
                        <Textarea id="input" value={String(jsonFormat)} onChange={(e) => setJsonFormat(e.target.value)} className="h-75" />
                        <Button className="w-full" type="button" onClick={handleSaveJson}>
                            <div className="flex items-center gap-4">Save</div>
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    )
}
