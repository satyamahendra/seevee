"use client"

import React, {useState} from "react"
import ResumeDisplay from "./resume-display"
import {
    ContentStateType,
    ContentType,
    FontStylesType,
    GeneralType,
    HandleAddContentType,
    HandleChangeContentType,
    HandleChangeSubContentType,
    HandleDeleteSubContentType,
    HandleDirectEditContentType,
    LinkType,
    MultipleInputInitialType,
    SkillType,
} from "../_static/type"
import {allContentInitials, generalInitial, linkInitial, skillInitial} from "../_static/var"
import {generateRandomNumber} from "@/utils/helpers/generateRandomNumber"
import {motion} from "motion/react"
import SettingsContainer from "./settings-container"
import type {ResumeRow} from "../../action"

type ResumeContainerProps = {
    resumeId: string
    resume: ContentStateType[]
    resumeData: ResumeRow
}

export default function ResumeContainer({resumeId, resume, resumeData}: ResumeContainerProps) {
    const [content, setContent] = useState<ContentStateType[]>(resume)
    const [selectedFontStyle, setSelectedFontStyle] = useState<FontStylesType>("default")
    const contentStates = {content, setContent}
    const settingsStates = {selectedFontStyle, setSelectedFontStyle}

    // content
    const handleChangeContent: HandleChangeContentType = (e, index) => {
        const {name, value} = e.target
        setContent((prev) => {
            const thisContent = prev[index]
            const changedContent = {...thisContent, [name]: value}

            return prev.map((con, index2) => (index === index2 ? changedContent : con))
        })
    }

    const handleAddContent: HandleAddContentType = (type: ContentType, title?: string) => {
        let newContent
        if (["project", "professional"].includes(type)) newContent = allContentInitials.find((con) => con.type === "general") as ContentStateType
        else newContent = allContentInitials.find((con) => con.type === type) as ContentStateType
        const newId = generateRandomNumber()
        setContent((prev) => [...prev, {...newContent, id: newId, title: title || ""}])
    }

    const handleDeleteContent = (index: number) => {
        setContent((prev) => prev.filter((con, index2) => index !== index2))
    }

    const handleDirectEditContent: HandleDirectEditContentType = (newData, index) => {
        setContent((prev) => prev.map((con, index2) => (index === index2 ? newData : con)))
    }

    // subcontent
    type SubContentArray = (LinkType | SkillType | GeneralType)[]
    const toArray = (con: ContentStateType, type: "links" | "skill" | "general"): SubContentArray =>
        (con as unknown as {[k: string]: SubContentArray})[type] ?? []

    const handleChangeSubContent: HandleChangeSubContentType = (e, type, index, subIndex) => {
        const {name, value} = e.target
        setContent((prev) => {
            const thisContent = prev[index]
            const arr = toArray(thisContent, type)
            const thisSubContent = arr[subIndex]
            const modifiedSubContent = {...(thisSubContent as Record<string, unknown>), [name]: value}
            const modifiedArray = arr.map((subc, j) => (subIndex === j ? (modifiedSubContent as LinkType) : subc))
            const modifiedContent = {...thisContent, [type]: modifiedArray} as ContentStateType
            return prev.map((con, j) => (index === j ? modifiedContent : con))
        })
    }

    const handleDeleteSubContent: HandleDeleteSubContentType = (type, index, subIndex) => {
        setContent((prev) => {
            const thisContent = prev[index]
            const modifiedContent = {...thisContent, [type]: toArray(thisContent, type).filter((_, j) => subIndex !== j)} as ContentStateType
            return prev.map((con, j) => (index === j ? modifiedContent : con))
        })
    }

    const handleAddMultipleInput = (type: "links" | "skill" | "general", index: number, nestedIndex?: number) => {
        const newId = generateRandomNumber()

        let newMultipleInput: MultipleInputInitialType
        if (type === "links") newMultipleInput = linkInitial
        if (type === "skill") newMultipleInput = skillInitial
        if (type === "general") newMultipleInput = generalInitial

        setContent((prev) => {
            const thisContent = prev[index]
            const currentArray = toArray(thisContent, type)

            const insertIndex = nestedIndex !== undefined ? nestedIndex : currentArray.length

            const newArray = [...currentArray.slice(0, insertIndex), {...newMultipleInput, id: newId}, ...currentArray.slice(insertIndex)]

            return prev.map((con, idx) => (idx === index ? ({...thisContent, [type]: newArray} as ContentStateType) : con))
        })
    }

    return (
        <motion.div
            initial={{opacity: 0, y: 12}}
            animate={{opacity: 1, y: 0}}
            transition={{bounce: 0}}
            className="flex w-full flex-col justify-center h-full gap-4">
            <div className="hidden">
                <div className="font-sans"></div>
                <div className="font-serif"></div>
                <div className="font-mono"></div>
            </div>
            <SettingsContainer
                contentStates={contentStates}
                settingsStates={settingsStates}
                resumeId={resumeId}
                handleDeleteContent={handleDeleteContent}
                handleAddContent={handleAddContent}
                resumeData={resumeData}
            />
            <ResumeDisplay
                contentStates={contentStates}
                settingsStates={settingsStates}
                resumeId={resumeId}
                handleAddContent={handleAddContent}
                handleChangeContent={handleChangeContent}
                handleAddMultipleInput={handleAddMultipleInput}
                handleChangeSubContent={handleChangeSubContent}
                handleDeleteSubContent={handleDeleteSubContent}
                handleDirectEditContent={handleDirectEditContent}
                handleDeleteContent={handleDeleteContent}
            />
        </motion.div>
    )
}
