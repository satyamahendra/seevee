"use client"

import React, {forwardRef, Fragment, JSX, useEffect, useState} from "react"
import {ContentStatesType, FontStylesType, GeneralContentType, HeaderContentType, SettingsStatesType, SkillContentType, SummaryContentType} from "../_static/type"
import HeaderPrint from "./resume-print/header-print"
import SummaryPrint from "./resume-print/summary-print"
import GeneralPrint from "./resume-print/general-print"
import SkillPrint from "./resume-print/skill-print"

type ResumePrintProps = {
    contentStates: ContentStatesType
    settingsStates: SettingsStatesType
}

function measureFont(className: string) {
    if (typeof document === "undefined") return ""
    const el = document.createElement("span")
    el.className = className
    document.body.appendChild(el)
    const font = getComputedStyle(el).fontFamily
    el.remove()
    return font
}

function getPrintFont(selectedFontStyle: FontStylesType): string {
    if (selectedFontStyle === "serif") return measureFont("font-serif")
    if (selectedFontStyle === "mono") return measureFont("font-mono")
    return measureFont("font-sans")
}

const ResumePrint = forwardRef<HTMLDivElement, ResumePrintProps>(({contentStates, settingsStates}, ref): JSX.Element => {
    const {content} = contentStates
    const {selectedFontStyle} = settingsStates
    const [fontFamily, setFontFamily] = useState("")

    useEffect(() => {
        setFontFamily(getPrintFont(selectedFontStyle))
    }, [selectedFontStyle])

    return (
        <div ref={ref} className="printContent px-6 py-2" style={fontFamily ? {fontFamily} : undefined}>
            {content.map((con, index) => {
                return (
                    <Fragment key={index}>
                        {con.type === "header" && <HeaderPrint data={con as HeaderContentType} />}
                        {con.type === "summary" && <SummaryPrint data={con as SummaryContentType} />}
                        {con.type === "general" && <GeneralPrint data={con as GeneralContentType} />}
                        {con.type === "skill" && <SkillPrint data={con as SkillContentType} />}
                    </Fragment>
                )
            })}
        </div>
    )
})

export default ResumePrint

ResumePrint.displayName = "ResumePrint"