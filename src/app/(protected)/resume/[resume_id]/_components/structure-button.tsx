import {Button} from "@/components/ui/button"
import {PiDotsSixVertical, PiPlus, PiSliders, PiTrash} from "react-icons/pi"
import {ContentStateType, ContentStatesType, GeneralContentType, GeneralType, HandleAddContentType, HandleDeleteContentType} from "../_static/type"
import {Reorder, motion} from "motion/react"
import ChooseContentButton from "./choose-content-button"
import ResumeDrawer from "@/components/custom/resume-drawer"
import {createFallbackKey} from "@/utils/helpers/createFallbackKey"

type StructureButtonProps = {
    contentStates: ContentStatesType
    handleDeleteContent: HandleDeleteContentType
    handleAddContent: HandleAddContentType
    className?: string
    variant?: "ghost" | "outline"
    iconOnly?: boolean
}

export default function StructureButton({contentStates, handleDeleteContent, handleAddContent, className, variant = "ghost", iconOnly = false}: StructureButtonProps) {
    const {content, setContent} = contentStates

    const handleGeneralReorder = (conIndex: number, newOrder: GeneralType[]) => {
        setContent((prev) => prev.map((item, index) => (index === conIndex ? ({...item, general: newOrder} as ContentStateType) : item)))
    }

    const handleDeleteGeneralItem = (conIndex: number, genIndex: number) => {
        setContent((prev) =>
            prev.map((item, index) => {
                if (index !== conIndex) return item
                const general = (item as GeneralContentType).general.filter((_, index2) => index2 !== genIndex)
                return {...item, general} as ContentStateType
            }),
        )
    }

    return (
        <ResumeDrawer
            title="Your Resume Structure"
            description="Make changes to your data here. Simply exit and your data will stay"
            trigger={
                <Button
                    size={iconOnly ? "icon" : "sm"}
                    variant={variant}
                    aria-label={iconOnly ? "Adjust structure" : undefined}
                    className={iconOnly ? `size-11 rounded-full cursor-pointer ${className ?? ""}` : `flex gap-2 justify-start cursor-pointer text-xs ${className ?? ""}`}>
                    <PiSliders />
                    {iconOnly ? null : "Adjust Structure"}
                </Button>
            }>
            <motion.div layout className="text-xs">
                <Reorder.Group axis="y" values={content} onReorder={setContent} className="space-y-2">
                    {content?.length > 0 &&
                        content.map((con, conIndex) => {
                            const fallbackKey = createFallbackKey()
                            return (
                                <Reorder.Item
                                    value={con}
                                    key={con?.id || fallbackKey}
                                    className="relative group flex items-center gap-2 cursor-grab bg-background rounded-lg p-2 w-full border"
                                    whileDrag={{
                                        cursor: "grabbing",
                                        zIndex: 20,
                                    }}
                                    layout>
                                    <div className="cursor-grab p-1 -mr-1">
                                        <PiDotsSixVertical />
                                    </div>
                                    <div className="flex flex-col items-start justify-between w-full">
                                        <div className="flex-1 truncate pr-8">
                                            {con.type === "header" && "Header"}
                                            {con.type === "summary" && "Summary"}
                                            {con.type === "general" && `${con?.title || "General"}`}
                                            {con.type === "skill" && "Skills"}
                                        </div>

                                        {con.type === "general" && con?.general?.length > 0 && (
                                            <Reorder.Group
                                                axis="y"
                                                values={con.general}
                                                onReorder={(newOrder) => {
                                                    handleGeneralReorder(conIndex, newOrder)
                                                }}
                                                className="space-y-2 mt-2 w-full">
                                                {con.general.map((gen, genIndex) => {
                                                    const genKey = gen.id || createFallbackKey()
                                                    return (
                                                        <Reorder.Item
                                                            key={genKey}
                                                            value={gen}
                                                            className="relative text-xs flex items-center gap-2 cursor-grab border rounded p-2 pr-8 bg-background truncate"
                                                            whileDrag={{
                                                                cursor: "grabbing",
                                                                zIndex: 30,
                                                            }}>
                                                            <PiDotsSixVertical className="shrink-0" />
                                                            <span className="flex-1 text-ellipsis text-muted-foreground truncate">{gen?.title || "Untitled"}</span>
                                                            <Button
                                                                onClick={() => handleDeleteGeneralItem(conIndex, genIndex)}
                                                                size="icon"
                                                                variant="ghost"
                                                                className="absolute right-1 w-5 h-5 text-muted-foreground hover:text-destructive">
                                                                <PiTrash />
                                                            </Button>
                                                        </Reorder.Item>
                                                    )
                                                })}
                                            </Reorder.Group>
                                        )}
                                    </div>

                                    <Button
                                        onClick={() => handleDeleteContent(conIndex)}
                                        size="icon"
                                        variant="ghost"
                                        className="absolute w-4 h-4 text-muted-foreground hover:text-destructive p-2 top-2 right-2">
                                        <PiTrash />
                                    </Button>
                                </Reorder.Item>
                            )
                        })}
                    {content.length === 0 && <div className="text-muted-foreground text-center h-16 flex items-center justify-center">Resume is a blank page!</div>}
                </Reorder.Group>
            </motion.div>
            <div className="flex w-full justify-center mt-4">
                <ChooseContentButton handleAddContent={handleAddContent}>
                    <Button size="icon" className="text-xs rounded-full">
                        <PiPlus />
                    </Button>
                </ChooseContentButton>
            </div>
        </ResumeDrawer>
    )
}
