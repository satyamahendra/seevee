"use client"

import ResumePrint from "@/app/(protected)/resume/[resume_id]/_components/resume-print"
import GeneralPrint from "@/app/(protected)/resume/[resume_id]/_components/resume-print/general-print"
import HeaderPrint from "@/app/(protected)/resume/[resume_id]/_components/resume-print/header-print"
import SkillPrint from "@/app/(protected)/resume/[resume_id]/_components/resume-print/skill-print"
import SummaryPrint from "@/app/(protected)/resume/[resume_id]/_components/resume-print/summary-print"
import {
    ContentStateType,
    FontStylesType,
    GeneralContentType,
    HeaderContentType,
    SkillContentType,
    SummaryContentType,
} from "@/app/(protected)/resume/[resume_id]/_static/type"
import {fontStyles} from "@/app/(protected)/resume/[resume_id]/_static/var"
import AnimatedContainer from "@/components/custom/animated-container"
import {Button} from "@/components/ui/button"
import {format} from "date-fns"
import Link from "next/link"
import {Fragment, useRef, useState} from "react"
import {PiDownloadSimple} from "react-icons/pi"
import {useReactToPrint} from "react-to-print"

type ResumeDisplayProps = {
    content: ContentStateType[]
}

export default function ResumeDisplay({content}: ResumeDisplayProps) {
    const [selectedFontStyle, setSelectedFontStyle] = useState<FontStylesType>("default")
    const handleSelectFontStyle = (type: FontStylesType) => setSelectedFontStyle(type)

    const contentStates = {content, setContent: () => {}}
    const settingsStates = {selectedFontStyle, setSelectedFontStyle: () => {}}

    const thisHeaderData = content.find((item) => item.type === "header")
    const printRef = useRef(null)
    const printResume = useReactToPrint({contentRef: printRef, documentTitle: `${thisHeaderData?.fullname || "Seevee"} Resume`})

    const handlePrintResume = () => {
        printResume()
    }

    return (
        <AnimatedContainer className=" sm:w-[55%] space-y-4">
            <div className="flex justify-betweeen flex-col gap-2 sm:flex-row items-center w-full">
                <Button onClick={handlePrintResume} className="text-xs h-7">
                    <PiDownloadSimple /> Download Resume
                </Button>
                <ResumePrint contentStates={contentStates} settingsStates={settingsStates} ref={printRef} />
                <div className="flex sm:ml-auto text-xs gap-2">
                    {fontStyles.map((fs) => {
                        const decideFont = fs === "default" ? "font-[family-name:var(--font-geist-sans)]" : `font-${fs}`
                        return (
                            <Button
                                variant={fs === selectedFontStyle ? "default" : "outline"}
                                key={fs}
                                className={`text-xs h-7 text-center duration-200 rounded-lg cursor-pointer hover:bg-muted hover:text-primary ${decideFont}`}
                                onClick={() => handleSelectFontStyle(fs)}>
                                {fs.charAt(0).toUpperCase() + fs.slice(1)}
                            </Button>
                        )
                    })}
                </div>
            </div>
            <div className={`bg-primary-foreground px-4 w-full pb-2 rounded-xl font-${selectedFontStyle}`}>
                {content.map((con, index) => (
                    <Fragment key={index}>
                        {con.type === "header" && <HeaderPrint data={con as HeaderContentType} />}
                        {con.type === "summary" && <SummaryPrint data={con as SummaryContentType} />}
                        {con.type === "general" && <GeneralPrint data={con as GeneralContentType} />}
                        {con.type === "skill" && <SkillPrint data={con as SkillContentType} />}
                    </Fragment>
                ))}
            </div>
            <div className="flex justify-center items-center">
                <Link href="/" className="text-xs text-muted-foreground text-center">
                    Powered by Seevee {format(new Date(), "yyyy")}
                </Link>
            </div>
        </AnimatedContainer>
    )
}
