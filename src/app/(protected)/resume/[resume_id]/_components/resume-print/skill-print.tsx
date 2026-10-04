"use client"

import React from "react"
import {SkillContentType} from "../../_static/type"

type SkillPrintProps = {
    data: SkillContentType
}

export default function SkillPrint({data}: SkillPrintProps) {
    return (
        <section className="pt-3 text-sm w-full avoid-break">
            <h2 className="font-[600] text-base border-b border-primary mx-2 mb-2">Skills</h2>
            <ul className="text-xs text-justify space-y-2">
                {data?.skill?.length > 0 &&
                    data.skill.map((skill, skillIndex) => {
                        return (
                            <li key={skillIndex} className="relative flex gap-2 h-full break-inside-avoid hover:bg-muted hover:rounded-lg duration-200">
                                <div className="font-[500] w-20 text-xs rounded-lg px-2 py-0.5">{skill.name}</div>
                                <ul className="flex gap-1 flex-wrap pl-2">
                                    {skill?.items?.length > 0 &&
                                        skill.items.map((item, itemIndex) => {
                                            return (
                                                <li key={itemIndex} className="px-2 h-fit border bg-muted rounded-md">
                                                    {item}
                                                </li>
                                            )
                                        })}
                                </ul>
                            </li>
                        )
                    })}
            </ul>
        </section>
    )
}
