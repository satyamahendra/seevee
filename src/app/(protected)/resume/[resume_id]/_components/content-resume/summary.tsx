import React from "react"
import {HandleChangeContentType, HandleDeleteContentType, SummaryContentType} from "../../_static/type"
import {Textarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import {PiPencil, PiTrash} from "react-icons/pi"
import ResumeDrawer from "@/components/custom/resume-drawer"
import SummaryForm from "../content-form/summary-form"
import {useScreenSize} from "@/utils/hooks/useScreenSize"
import DrawerDeleteButton from "../drawer-delete-button"

type SummaryProps = {
    data: SummaryContentType
    index: number
    handleChangeContent: HandleChangeContentType
    handleDeleteContent: HandleDeleteContentType
}

export default function Summary({data, index, handleChangeContent, handleDeleteContent}: SummaryProps) {
    const {isMobile} = useScreenSize()

    const form = <SummaryForm data={data} index={index} handleChangeContent={handleChangeContent} />

    const detail = (
        <>
            {form}
            <DrawerDeleteButton handleConfirm={() => handleDeleteContent(index)} label="Delete section" description="This section will be removed from your resume." />
        </>
    )

    const inner = (
        <>
            <div className="flex items-center border-b border-primary  gap-2">
                <h2 className="text-base font-semibold">Summary</h2>
                <div className="opacity-0 group-hover:opacity-100 duration-200">
                    <Button size="icon" variant="outline" className="w-6 h-6" onClick={() => handleDeleteContent(index)}>
                        <PiTrash />
                    </Button>
                </div>
            </div>
            <Textarea
                style={{fontSize: "0.75rem"}}
                className="min-h-fit mt-3 border-none bg-primary-foreground group-hover:bg-muted text-justify resize-none group-hover:resize-y shadow-none p-0 field-sizing-content focus-visible:border-transparent focus-visible:ring-0"
                id="text"
                name="text"
                placeholder="Your achievements here..."
                value={data?.text || ""}
                onChange={(e) => handleChangeContent(e, index)}
            />
        </>
    )

    if (isMobile)
        return (
            <ResumeDrawer
                title="Summary"
                description="Make changes to your data here. Simply exit and your data will stay"
                trigger={
                    <section className="relative avoid-break group hover:bg-muted duration-200 px-2 rounded-xl cursor-pointer">{inner}</section>
                }>
                {detail}
            </ResumeDrawer>
        )

    return (
        <section className="relative avoid-break group hover:bg-muted duration-200 px-2 rounded-xl">
            {inner}
            <ResumeDrawer
                title="Summary"
                description="Make changes to your data here. Simply exit and your data will stay"
                trigger={
                    <div className="absolute opacity-0 group-hover:opacity-100 duration-200 top-1 right-1">
                        <Button size="icon" variant="outline" className="w-6 h-6">
                            <PiPencil />
                        </Button>
                    </div>
                }>
                {detail}
            </ResumeDrawer>
        </section>
    )
}
