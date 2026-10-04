import {Button} from "@/components/ui/button"
import {PiDotsSixVertical, PiPlus, PiSliders, PiTrash} from "react-icons/pi"
import {ContentStateType, ContentStatesType, GeneralType, HandleAddContentType, HandleDeleteContentType} from "../_static/type"
import {Reorder, motion} from "motion/react"
import ChooseContentButton from "./choose-content-button"
import ResumeDrawer from "@/components/custom/resume-drawer"
import {createFallbackKey} from "@/util/helpers/createFallbackKey"
import {useScreenSize} from "@/utils/hooks/useScreenSize"

type StructureButtonProps = {
    contentStates: ContentStatesType
    handleDeleteContent: HandleDeleteContentType
    handleAddContent: HandleAddContentType
    className?: string
}

export default function StructureButton({contentStates, handleDeleteContent, handleAddContent, className}: StructureButtonProps) {
    const {content, setContent} = contentStates
    const {isMobile} = useScreenSize()

    const handleGeneralReorder = (conIndex: number, newOrder: GeneralType[]) => {
        setContent((prev) => prev.map((item, index) => (index === conIndex ? ({...item, general: newOrder} as ContentStateType) : item)))
    }

    return (
        <ResumeDrawer
            title="Your Resume Structure"
            description="Make changes to your data here. Simply exit and your data will stay"
            tooltip={isMobile ? null : "Restructure Resume"}
            trigger={
                <Button size={isMobile ? "default" : "icon-sm"} variant="outline" className={`cursor-pointer ${isMobile && "w-full"}`}>
                    <PiSliders />
                    {isMobile && "Restructure Resume"}
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
                                        <div className="flex-1 truncate pr-2">
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
                                                {con.general.map((gen) => {
                                                    const genKey = gen.id || createFallbackKey()
                                                    return (
                                                        <Reorder.Item
                                                            key={genKey}
                                                            value={gen}
                                                            className="text-xs flex items-center gap-2 cursor-grab border rounded p-2 bg-background truncate"
                                                            whileDrag={{
                                                                cursor: "grabbing",
                                                                zIndex: 30,
                                                            }}>
                                                            <PiDotsSixVertical className="shrink-0" />
                                                            <span className="text-ellipsis text-muted-foreground truncate">{gen?.title || "Untitled"}</span>
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
                                        className="absolute opacity-0 group-hover:opacity-100 duration-200 w-4 h-4 text-muted-foreground p-2 top-2 right-2">
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
