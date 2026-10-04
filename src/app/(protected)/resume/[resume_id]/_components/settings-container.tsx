"use client"

import {Button} from "@/components/ui/button"
import React, {useRef, useState} from "react"
import {PiArrowSquareOut, PiCaretLeft, PiCopySimple, PiDownloadSimple, PiFileText, PiFileX, PiGear, PiLockKey, PiLockKeyOpen, PiTrash} from "react-icons/pi"
import AiButton from "./ai-button"
import StructureButton from "./structure-button"
import JsonButton from "./json-button"
import {ContentStatesType, FontStylesType, HandleAddContentType, HandleDeleteContentType, SettingsStatesType} from "../_static/type"
import {dummyResumeData, emptyResume, fontStyles} from "../_static/var"
import {deleteResume} from "../../action"
import {toast} from "sonner"
import {redirect} from "next/navigation"
import Link from "next/link"
import ResumePrint from "./resume-print"
import {useReactToPrint} from "react-to-print"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Separator} from "@/components/ui/separator"
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import ConfirmationPopover from "@/components/custom/confirmation-popover"
import {Switch} from "@/components/ui/switch"
import {Label} from "@/components/ui/label"
import {uuidToShort} from "@/util/helpers/shortenResumeID"
import {togglePublicResume} from "../action"
import {getBaseUrl} from "@/util/helpers/getBaseUrl"
import {copyToClipboard} from "@/util/helpers/copyToClipboard"
import MenuActions from "./menu-actions"
import type {ResumeRow} from "../../action"

type SettingsType = {
    contentStates: ContentStatesType
    settingsStates: SettingsStatesType
    resumeId: string
    handleDeleteContent: HandleDeleteContentType
    handleAddContent: HandleAddContentType
    resumeData: ResumeRow
}

export default function SettingsContainer({contentStates, settingsStates, resumeId, handleDeleteContent, handleAddContent, resumeData}: SettingsType) {
    const {content, setContent} = contentStates
    const {selectedFontStyle, setSelectedFontStyle} = settingsStates
    const [isOpen, setIsOpen] = useState(false)
    const [isPublic, setIsPublic] = useState(resumeData.isPublic)
    const [isLoading, setIsLoading] = useState(false)

    const handleApplyResumeData = (type: "fake" | "empty") => {
        if (type === "fake") setContent(dummyResumeData)
        if (type === "empty") setContent(emptyResume)
    }

    const handleDeleteResume = async () => {
        const res = await deleteResume(resumeId)
        if (res.error) toast(res.error)
        if (res.data) {
            toast.success("Successfully deleted a resume!")
            redirect("/resume")
        }
    }

    const thisHeaderData = content.find((item) => item.type === "header")
    const printRef = useRef(null)
    const printResume = useReactToPrint({
        contentRef: printRef,
        documentTitle: `${thisHeaderData?.fullname || "Seevee"} Resume`,
        pageStyle: `
            @page {
                margin: 0;
            }
            @media print {
                body {
                    color-adjust: exact;
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }
            }
            html {
                font-size: 16px !important;
            }
        `,
    })
    const handlePrintResume = () => {
        printResume()
        setIsOpen(false)
    }

    const handleTogglePublic = async () => {
        setIsLoading(true)
        const res = await togglePublicResume(resumeId)
        if (res.error) toast(res.error)
        if (res.data) {
            setIsPublic(res.data.isPublic)
            toast(
                <div className="flex items-center gap-3">
                    {res.data.isPublic ? <PiLockKeyOpen className="text-lg" /> : <PiLockKey className="text-lg" />}
                    {res.data.isPublic ? "Your resume is now public!" : "Your resume is now private!"}
                </div>
            )
        }
        setIsLoading(false)
    }

    const handleCopyToClipboard = () => {
        copyToClipboard(`${getBaseUrl()}/${uuidToShort(resumeId)}`)
        toast(
            <div className="flex items-center gap-3 ">
                <PiCopySimple className="text-lg" />
                Your resume link has been copied to clipboard!
            </div>
        )
    }

    const menuActionsProps = {
        contentStates,
        settingsStates,
        resumeId,
        handleAddContent,
        handleDeleteContent,
        isPublic,
        isLoading,
        handleTogglePublic,
        handleCopyToClipboard,
        handleApplyResumeData,
        handleDeleteResume,
    }

    return (
        <>
            {/* desktop toolbar */}
            <div className="hidden sm:flex flex-wrap items-center gap-1.5">
                <Link href="/resume">
                    <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Back to resumes">
                        <PiCaretLeft />
                    </Button>
                </Link>

                <Select value={selectedFontStyle} onValueChange={(value) => setSelectedFontStyle(value as FontStylesType)}>
                    <SelectTrigger size="sm" className="h-8 gap-1 pr-1.5 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {fontStyles.map((fs) => (
                            <SelectItem key={fs} value={fs}>
                                {fs.charAt(0).toUpperCase() + fs.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <AiButton contentStates={contentStates} resumeId={resumeId} className="w-fit px-3" />
                <StructureButton
                    contentStates={contentStates}
                    handleAddContent={handleAddContent}
                    handleDeleteContent={handleDeleteContent}
                    className="h-8 flex items-center gap-1.5 px-2"
                />
                <Button onClick={handlePrintResume} size="sm" variant="ghost" className="h-8 flex items-center gap-1.5 px-2">
                    <PiDownloadSimple />
                    Download
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <div className="flex items-center gap-1.5">
                    <Switch id="is-resume-public" className="scale-75" disabled={isLoading} checked={isPublic} onCheckedChange={handleTogglePublic} />
                    <Label htmlFor="is-resume-public" className="text-xs">
                        {isPublic ? "Public" : "Private"}
                    </Label>
                </div>
                {isPublic && (
                    <>
                        <Link href={`/${uuidToShort(resumeId)}`} target="_blank">
                            <Button size="sm" variant="ghost" className="h-8 flex items-center gap-1.5 px-2">
                                <PiArrowSquareOut />
                                Open
                            </Button>
                        </Link>
                        <Button onClick={handleCopyToClipboard} size="sm" variant="ghost" className="h-8 flex items-center gap-1.5 px-2">
                            <PiCopySimple /> Copy
                        </Button>
                    </>
                )}

                <Separator orientation="vertical" className="h-6 mx-1" />

                <ConfirmationPopover
                    button={
                        <Button size="sm" variant="ghost" className="h-8 flex items-center gap-1.5 px-2">
                            <PiFileText />
                            Fake data
                        </Button>
                    }
                    handleConfirm={() => handleApplyResumeData("fake")}
                    description="Your resume will be overwritten by the fake data if you continue."
                    title="Are you sure?"
                />
                <ConfirmationPopover
                    button={
                        <Button size="sm" variant="ghost" className="h-8 flex items-center gap-1.5 px-2">
                            <PiFileX />
                            Clear
                        </Button>
                    }
                    handleConfirm={() => handleApplyResumeData("empty")}
                    description="Your resume will be overwritten by the empty resume if you continue."
                    title="Are you sure?"
                />
                <JsonButton contentStates={contentStates} className="h-8 flex items-center gap-1.5 px-2" />

                <ConfirmationPopover
                    button={
                        <Button size="sm" variant="ghost" className="h-8 text-destructive flex items-center gap-1.5 px-2">
                            <PiTrash />
                            Delete
                        </Button>
                    }
                    handleConfirm={handleDeleteResume}
                    description="Your resume will deleted forever if you continue."
                    title="Are you sure?"
                />
            </div>

            {/* mobile view */}
            <div className="sm:hidden fixed bottom-3 right-3 z-50">
                <Drawer swipeDirection="down" open={isOpen} onOpenChange={setIsOpen}>
                    <DrawerContent className="max-h-[80vh]">
                        <DrawerHeader className="text-left mb-4">
                            <DrawerTitle>Resume Settings</DrawerTitle>
                        </DrawerHeader>

                        <div className="space-y-2 overflow-y-auto p-4 pt-0 flex-1">
                            <Button onClick={handlePrintResume} size="sm" variant="ghost" className="w-full h-6 flex justify-start gap-3 px-2">
                                <PiDownloadSimple />
                                Download resume
                            </Button>
                            <MenuActions {...menuActionsProps} showFont />
                        </div>
                    </DrawerContent>
                </Drawer>

                <Button size="icon" className="rounded-full w-14 h-14 shadow-lg" aria-label="Open settings" onClick={() => setIsOpen(true)}>
                    <PiGear className="w-8 h-8" />
                </Button>
            </div>

            <ResumePrint contentStates={contentStates} settingsStates={settingsStates} ref={printRef} />
        </>
    )
}