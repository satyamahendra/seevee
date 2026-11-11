"use client"

import React, {Fragment, useEffect, useRef, useState} from "react"
import {
    ContentStatesType,
    HandleAddContentType,
    HandleAddMultipleInputType,
    HandleChangeContentType,
    HandleChangeSubContentType,
    HandleDeleteContentType,
    HandleDeleteSubContentType,
    HandleDirectEditContentType,
    SettingsStatesType,
} from "../_static/type"
import Header from "./content-resume/header"
import Summary from "./content-resume/summary"
import Skill from "./content-resume/skill"
import {ScrollArea} from "@/components/ui/scroll-area"
import {PiCheck, PiCircleNotch, PiPlus} from "react-icons/pi"
import {updateResume} from "../action"
import {toast} from "sonner"
import {useDelay} from "@/utils/hooks/useWaitFirstRender"
import {useDebounce} from "@/utils/hooks/useDebounce"
import {AnimatePresence, motion} from "motion/react"
import General from "./content-resume/general"
import ChooseContentButton from "./choose-content-button"
import {Button} from "@/components/ui/button"
import {fontStyleClass} from "../_static/var"

type ResumeProps = {
    contentStates: ContentStatesType
    settingsStates: SettingsStatesType
    resumeId: string
    handleAddContent: HandleAddContentType
    handleChangeContent: HandleChangeContentType
    handleAddMultipleInput: HandleAddMultipleInputType
    handleChangeSubContent: HandleChangeSubContentType
    handleDeleteSubContent: HandleDeleteSubContentType
    handleDirectEditContent: HandleDirectEditContentType
    handleDeleteContent: HandleDeleteContentType
}

export default function ResumeDisplay({
    contentStates,
    settingsStates,
    resumeId,
    handleAddContent,
    handleChangeContent,
    handleAddMultipleInput,
    handleChangeSubContent,
    handleDeleteSubContent,
    handleDirectEditContent,
    handleDeleteContent,
}: ResumeProps) {
    const {content, isAiGenerating} = contentStates
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const {selectedFontStyle} = settingsStates

    const isReady = useDelay()
    const stringifiedResume = JSON.stringify(content)
    const debouncedValue = useDebounce(stringifiedResume, 2000)

    const lastSavedRef = useRef(debouncedValue)

    useEffect(() => {
        if (isReady && !isAiGenerating && stringifiedResume !== lastSavedRef.current) {
            setIsSaving(true)
        }
    }, [stringifiedResume, isReady, isAiGenerating])

    useEffect(() => {
        // Wait for the debounce to settle so a streamed AI edit is written once, at the end.
        if (!isReady || isAiGenerating || debouncedValue !== stringifiedResume) return

        const save = async () => {
            setIsSaving(true)
            const res = await updateResume(resumeId, content)
            setIsSaving(false)
            if (res.error) toast(res.error)
            else lastSavedRef.current = debouncedValue
        }

        save()
    }, [debouncedValue, stringifiedResume, isReady, isAiGenerating, content, resumeId])

    const isEmpty = content.length < 1

    return (
        <>
            <section className={`h-full w-full flex flex-col gap-2 ${fontStyleClass(selectedFontStyle)} min-h-0 flex-1`}>
                <div className="pr-2 h-full w-full bg-primary-foreground overflow-auto rounded-xl pl-3 py-3 border">
                    <ScrollArea className="h-full w-full pr-4">
                        <div className="space-y-4 max-sm:zoom-[0.85]">
                            {content.map((con, index) => {
                                return (
                                    <Fragment key={index}>
                                        {con.type === "header" ? (
                                            <Header
                                                data={con}
                                                index={index}
                                                handleChangeContent={handleChangeContent}
                                                handleAddMultipleInput={handleAddMultipleInput}
                                                handleChangeSubContent={handleChangeSubContent}
                                                handleDeleteSubContent={handleDeleteSubContent}
                                                handleDeleteContent={handleDeleteContent}
                                            />
                                        ) : null}
                                        {con.type === "summary" ? (
                                            <Summary data={con} index={index} handleChangeContent={handleChangeContent} handleDeleteContent={handleDeleteContent} />
                                        ) : null}
                                        {con.type === "skill" ? (
                                            <Skill
                                                data={con}
                                                conIndex={index}
                                                handleChangeContent={handleChangeContent}
                                                handleAddMultipleInput={handleAddMultipleInput}
                                                handleChangeSubContent={handleChangeSubContent}
                                                handleDeleteSubContent={handleDeleteSubContent}
                                                handleDirectEditContent={handleDirectEditContent}
                                                handleDeleteContent={handleDeleteContent}
                                            />
                                        ) : null}
                                        {con.type === "general" ? (
                                            <General
                                                data={con}
                                                index={index}
                                                handleChangeContent={handleChangeContent}
                                                handleAddMultipleInput={handleAddMultipleInput}
                                                handleChangeSubContent={handleChangeSubContent}
                                                handleDeleteSubContent={handleDeleteSubContent}
                                                handleDirectEditContent={handleDirectEditContent}
                                                handleDeleteContent={handleDeleteContent}
                                            />
                                        ) : null}
                                    </Fragment>
                                )
                            })}
                            <ChooseContentButton handleAddContent={handleAddContent}>
                                <Button className="flex h-fit shadow-none w-full text-xs hover:bg-primary-foreground group bg-muted duration-200 cursor-pointer text-muted-foreground rounded-lg px-4 py-6 items-center justify-center gap-2 border-2 border-dashed">
                                    {isEmpty ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
                                                <PiPlus />
                                            </div>
                                            <div>You have a blank page!</div>
                                            <div>Add a new content</div>
                                        </div>
                                    ) : (
                                        <>
                                            <PiPlus /> Add New Content
                                        </>
                                    )}
                                </Button>
                            </ChooseContentButton>
                        </div>
                    </ScrollArea>
                </div>
                <div className="text-xs font-(family-name:--font-geist-sans) flex justify-center gap-2 text-muted-foreground h-5">
                    <AnimatePresence mode="wait">
                        {!isReady ? (
                            <motion.div key="syncing" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex items-center gap-2">
                                <PiCircleNotch className="animate-spin text-base" />
                                synchronizing...
                            </motion.div>
                        ) : isSaving ? (
                            <motion.div key="saving" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex items-center gap-2">
                                <PiCircleNotch className="animate-spin text-base" />
                                saving...
                            </motion.div>
                        ) : (
                            <motion.div key="saved" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex items-center gap-2">
                                <PiCheck className="text-base" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </>
    )
}
