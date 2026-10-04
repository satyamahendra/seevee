"use client"

import {Button} from "@/components/ui/button"
import React, {useRef, useState} from "react"
import {
    PiArrowSquareOut,
    PiCaretLeft,
    PiCopySimple,
    PiDownloadSimple,
    PiFileText,
    PiFileX,
    PiGear,
    PiLockKey,
    PiLockKeyFill,
    PiLockKeyOpen,
    PiLockKeyOpenFill,
    PiTrash,
} from "react-icons/pi"
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
import {Separator} from "@/components/ui/separator"
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import ConfirmationPopover from "@/components/custom/confirmation-popover"
import {Switch} from "@/components/ui/switch"
import {Label} from "@/components/ui/label"
import {uuidToShort} from "@/util/helpers/shortenResumeID"
import {togglePublicResume} from "../action"
import {getBaseUrl} from "@/util/helpers/getBaseUrl"
import {copyToClipboard} from "@/util/helpers/copyToClipboard"
import type {ResumeRow} from "../../action"
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip"
import {normalizeText} from "@/util/helpers/normalizeText"
import {TiLockClosed, TiLockOpen} from "react-icons/ti"

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
                </div>,
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
            </div>,
        )
    }

    return (
        <>
            {/* desktop toolbar */}
            <div className="hidden sm:flex flex-wrap items-center gap-1.5">
                <div className="flex gap-2">
                    {fontStyles.map((fs) => (
                        <Tooltip key={fs}>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => setSelectedFontStyle(fs)}
                                    size="icon-sm"
                                    className={`cursor-pointer font-${fs}`}
                                    variant={selectedFontStyle === fs ? "secondary" : "outline"}
                                    aria-label={`Change font style to ${fs}`}>
                                    f
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{normalizeText(fs)}</TooltipContent>
                        </Tooltip>
                    ))}

                    <Separator orientation="vertical" className="mx-1" />

                    <StructureButton
                        contentStates={contentStates}
                        handleAddContent={handleAddContent}
                        handleDeleteContent={handleDeleteContent}
                        className="h-8 flex items-center gap-1.5 px-2"
                    />

                    <Separator orientation="vertical" className="mx-1" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={isPublic ? "outline" : "secondary"} size="icon-sm" onClick={handleTogglePublic}>
                                {isPublic ? <TiLockOpen /> : <TiLockClosed />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{isPublic ? "Make it private" : "Make it public"}</TooltipContent>
                    </Tooltip>

                    {isPublic && (
                        <>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href={`/${uuidToShort(resumeId)}`} target="_blank">
                                        <Button size="icon-sm" variant="outline" className="h-8 flex items-center gap-1.5 px-2">
                                            <PiArrowSquareOut />
                                        </Button>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>View your resume</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button onClick={handleCopyToClipboard} size="icon-sm" variant="outline" className="h-8 flex items-center gap-1.5 px-2">
                                        <PiCopySimple />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy your resume link</TooltipContent>
                            </Tooltip>
                        </>
                    )}

                    <Separator orientation="vertical" className="mx-1" />

                    <AiButton contentStates={contentStates} resumeId={resumeId} className="w-fit px-3" />
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={handlePrintResume} size="icon-sm" variant="outline" className="cursor-pointer">
                                <PiDownloadSimple />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="mx-1" />

                    <ConfirmationPopover
                        tooltip={"Apply Dummy data"}
                        button={
                            <Button size="icon-sm" variant="outline" className="cursor-pointer">
                                <PiFileText />
                            </Button>
                        }
                        handleConfirm={() => handleApplyResumeData("fake")}
                        description="Your resume will be overwritten by the fake data if you continue."
                        title="Are you sure?"
                    />

                    <ConfirmationPopover
                        tooltip={"Clear resume"}
                        button={
                            <Button size="icon-sm" variant="outline" className="cursor-pointer">
                                <PiFileX />
                            </Button>
                        }
                        handleConfirm={() => handleApplyResumeData("empty")}
                        description="Your resume will be overwritten by the empty resume if you continue."
                        title="Are you sure?"
                    />

                    <Separator orientation="vertical" className="mx-1" />

                    <JsonButton contentStates={contentStates} className="h-8 flex items-center gap-1.5 px-2" />

                    <Separator orientation="vertical" className="mx-1" />

                    <ConfirmationPopover
                        tooltip={"Delete resume"}
                        button={
                            <Button size="icon-sm" variant="destructive" className="cursor-pointer">
                                <PiTrash />
                            </Button>
                        }
                        handleConfirm={handleDeleteResume}
                        description="Your resume will deleted forever if you continue."
                        title="Are you sure?"
                    />
                </div>
            </div>

            {/* mobile view */}
            <div className="sm:hidden fixed bottom-3 right-3 z-50">
                <Drawer swipeDirection="down" open={isOpen} onOpenChange={setIsOpen}>
                    <DrawerContent className="max-h-[80vh]">
                        <DrawerHeader className="text-left mb-4">
                            <DrawerTitle>Resume Settings</DrawerTitle>
                        </DrawerHeader>

                        <div className="space-y-4 overflow-y-auto p-4 pt-0 flex-1">
                            <div className="flex gap-4  ">
                                {fontStyles.map((fs) => (
                                    <Button
                                        key={fs}
                                        onClick={() => setSelectedFontStyle(fs)}
                                        size="default"
                                        className={`cursor-pointer flex-1 font-${fs}`}
                                        variant={selectedFontStyle === fs ? "secondary" : "outline"}
                                        aria-label={`Change font style to ${fs}`}>
                                        {normalizeText(fs)}
                                    </Button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <StructureButton
                                    contentStates={contentStates}
                                    handleAddContent={handleAddContent}
                                    handleDeleteContent={handleDeleteContent}
                                    className="h-8 flex items-center gap-1.5 px-2"
                                />

                                <Button onClick={handlePrintResume} variant="outline" className="w-full justify-center gap-3">
                                    <PiDownloadSimple className="size-5" />
                                    Download resume
                                </Button>

                                <Button onClick={handleTogglePublic} disabled={isLoading} variant="outline" className="w-full justify-center gap-3">
                                    {isPublic ? <TiLockOpen className="size-5" /> : <TiLockClosed className="size-5" />}
                                    {isPublic ? "Make resume private" : "Make resume public"}
                                </Button>

                                {isPublic && (
                                    <>
                                        <Link href={`/${uuidToShort(resumeId)}`} target="_blank" className="block w-full">
                                            <Button variant="outline" className="w-full justify-center gap-3">
                                                <PiArrowSquareOut className="size-5" />
                                                View your resume
                                            </Button>
                                        </Link>
                                        <Button onClick={handleCopyToClipboard} variant="outline" className="w-full justify-center gap-3">
                                            <PiCopySimple className="size-5" />
                                            Copy resume link
                                        </Button>
                                    </>
                                )}

                                <ConfirmationPopover
                                    button={
                                        <Button variant="outline" className="w-full justify-center gap-3">
                                            <PiFileText className="size-5" />
                                            Apply dummy data
                                        </Button>
                                    }
                                    handleConfirm={() => handleApplyResumeData("fake")}
                                    description="Your resume will be overwritten by the fake data if you continue."
                                    title="Are you sure?"
                                />

                                <ConfirmationPopover
                                    button={
                                        <Button variant="outline" className="w-full justify-center gap-3">
                                            <PiFileX className="size-5" />
                                            Clear resume
                                        </Button>
                                    }
                                    handleConfirm={() => handleApplyResumeData("empty")}
                                    description="Your resume will be overwritten by the empty resume if you continue."
                                    title="Are you sure?"
                                />

                                <JsonButton contentStates={contentStates} className="w-full" />

                                <ConfirmationPopover
                                    button={
                                        <Button variant="destructive" className="w-full justify-center gap-3">
                                            <PiTrash className="size-5" />
                                            Delete resume
                                        </Button>
                                    }
                                    handleConfirm={handleDeleteResume}
                                    description="Your resume will deleted forever if you continue."
                                    title="Are you sure?"
                                />
                            </div>
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
