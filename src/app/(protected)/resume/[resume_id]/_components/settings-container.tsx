"use client"

import {Button} from "@/components/ui/button"
import {useRef, useState} from "react"
import {
    PiArrowSquareOut,
    PiCopySimple,
    PiDownloadSimple,
    PiFileText,
    PiFileX,
    PiDotsThreeVertical,
    PiLock,
    PiLockKey,
    PiLockKeyOpen,
    PiLockOpen,
    PiMagicWandFill,
    PiPlus,
    PiTrash,
} from "react-icons/pi"
import AiButton from "./ai-button"
import StructureButton from "./structure-button"
import JsonButton from "./json-button"
import {ContentStatesType, FontStylesType, HandleAddContentType, HandleDeleteContentType, SettingsStatesType} from "../_static/type"
import {dummyResumeData, emptyResume, fontStyles, fontStyleClass} from "../_static/var"
import {deleteResume} from "../../action"
import {toast} from "sonner"
import {redirect} from "next/navigation"
import Link from "next/link"
import ResumePrint from "./resume-print"
import {useReactToPrint} from "react-to-print"
import {Separator} from "@/components/ui/separator"
import {Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import {Switch} from "@/components/ui/switch"
import ConfirmationPopover from "@/components/custom/confirmation-popover"
import {uuidToShort} from "@/utils/helpers/shortenResumeID"
import {togglePublicResume} from "../action"
import {getBaseUrl} from "@/utils/helpers/getBaseUrl"
import {copyToClipboard} from "@/utils/helpers/copyToClipboard"
import type {ResumeRow} from "../../action"
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip"
import {normalizeText} from "@/utils/helpers/normalizeText"
import ChooseContentButton from "./choose-content-button"

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
            <div className="hidden sm:flex flex-wrap flex-col items-center gap-1.5 max-w-38">
                <div className="flex flex-col gap-1 h-full">
                    <div className="rounded-xl flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 aspect-square bg-muted rounded-lg border">
                            <PiMagicWandFill className="text-xl text-blue-500" />
                        </div>
                        <div className="text-xs text-center text-muted-foreground">Use AI to Tailor your resume!</div>
                        <AiButton contentStates={contentStates} resumeId={resumeId} className="w-full px-3" />
                    </div>

                    <Separator orientation="horizontal" className="mt-4 mb-2" />

                    <div className="text-xs text-muted-foreground mt-2">Style</div>
                    <div className="flex justify-between">
                        {fontStyles.map((fs) => (
                            <Tooltip key={fs}>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => setSelectedFontStyle(fs)}
                                        size="icon-sm"
                                        className={`cursor-pointer ${fontStyleClass(fs)}`}
                                        variant={selectedFontStyle === fs ? "secondary" : "outline"}
                                        aria-label={`Change font style to ${fs}`}>
                                        f
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{normalizeText(fs)}</TooltipContent>
                            </Tooltip>
                        ))}
                    </div>

                    <Separator orientation="vertical" className="mx-1" />

                    <div className="text-xs text-muted-foreground mt-2">Settings</div>
                    <StructureButton contentStates={contentStates} handleAddContent={handleAddContent} handleDeleteContent={handleDeleteContent} />

                    <ChooseContentButton handleAddContent={handleAddContent}>
                        <Button variant={"ghost"} size="sm" className="flex cursor-pointer justify-start gap-2 text-xs">
                            <PiPlus /> Add Content
                        </Button>
                    </ChooseContentButton>

                    <div className="text-xs text-muted-foreground mt-2">Privacy</div>
                    <Button variant={"ghost"} className="flex cursor-pointer justify-start gap-2 w-full text-xs" onClick={handleTogglePublic}>
                        {isPublic ? <PiLock size={22} /> : <PiLockOpen size={22} />}
                        {isPublic ? "Public" : "Private"}
                    </Button>

                    {isPublic && (
                        <>
                            <Link href={`/${uuidToShort(resumeId)}`} target="_blank">
                                <Button size="sm" variant="ghost" className="flex cursor-pointer justify-start gap-2 w-full text-xs">
                                    <PiArrowSquareOut /> View Resume
                                </Button>
                            </Link>

                            <Button onClick={handleCopyToClipboard} size="sm" variant="ghost" className="flex cursor-pointer justify-start gap-2 w-full text-xs">
                                <PiCopySimple /> Copy link
                            </Button>
                        </>
                    )}

                    <div className="text-xs text-muted-foreground mt-2">Actions</div>
                    <Button onClick={handlePrintResume} size="sm" variant="ghost" className="cursor-pointer flex justify-start gap-2 text-xs">
                        <PiDownloadSimple /> Download
                    </Button>

                    <ConfirmationPopover
                        button={
                            <Button size="sm" variant="ghost" className="cursor-pointer flex justify-start gap-2 text-xs">
                                <PiFileText /> Dummy data
                            </Button>
                        }
                        handleConfirm={() => handleApplyResumeData("fake")}
                        description="Your resume will be overwritten by the fake data if you continue."
                        title="Are you sure?"
                    />

                    <ConfirmationPopover
                        button={
                            <Button size="sm" variant="ghost" className="cursor-pointer flex justify-start gap-2 text-xs">
                                <PiFileX /> Clear resume
                            </Button>
                        }
                        handleConfirm={() => handleApplyResumeData("empty")}
                        description="Your resume will be overwritten by the empty resume if you continue."
                        title="Are you sure?"
                    />

                    <JsonButton contentStates={contentStates} />

                    <ConfirmationPopover
                        button={
                            <Button size="sm" variant="destructive" className="mt-auto cursor-pointer flex justify-start gap-2 text-xs">
                                <PiTrash /> Delete resume
                            </Button>
                        }
                        handleConfirm={handleDeleteResume}
                        description="Your resume will deleted forever if you continue."
                        title="Are you sure?"
                    />
                </div>
            </div>

            {/* mobile view */}
            <div className="sm:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
                <Drawer swipeDirection="down" open={isOpen} onOpenChange={setIsOpen} showSwipeHandle>
                    <DrawerContent className="[--drawer-content-max-height:88dvh]">
                        <DrawerHeader className="text-left">
                            <DrawerTitle>Resume settings</DrawerTitle>
                            <DrawerDescription>Tailor, style, and share your resume.</DrawerDescription>
                        </DrawerHeader>

                        <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 pb-8 pt-2">
                            <div className="flex flex-col items-center rounded-xl border border-blue-500/25 bg-blue-500/5 p-3 text-center">
                                <div className="flex size-10 items-center justify-center rounded-lg border bg-background">
                                    <PiMagicWandFill className="text-xl text-blue-500" />
                                </div>
                                <div className="mt-2 text-xs font-medium">AI Tailor</div>
                                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Paste a job description and let AI rewrite your resume to match. Costs 1 credit.</p>
                                <AiButton contentStates={contentStates} resumeId={resumeId} className="mt-3 w-full" />
                            </div>

                            <section className="space-y-2">
                                <p className="px-1 text-xs text-muted-foreground">Style</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {fontStyles.map((fs) => (
                                        <Button
                                            key={fs}
                                            onClick={() => setSelectedFontStyle(fs)}
                                            variant={selectedFontStyle === fs ? "secondary" : "outline"}
                                            aria-pressed={selectedFontStyle === fs}
                                            className={`w-full ${fontStyleClass(fs)} ${selectedFontStyle === fs ? "ring-1 ring-primary/40" : ""}`}>
                                            {normalizeText(fs)}
                                        </Button>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-2">
                                <p className="px-1 text-xs text-muted-foreground">Settings</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <ChooseContentButton handleAddContent={handleAddContent}>
                                        <Button variant="outline" className="w-full h-11 justify-center gap-2">
                                            <PiPlus className="size-5" /> Add content
                                        </Button>
                                    </ChooseContentButton>
                                    <StructureButton
                                        contentStates={contentStates}
                                        handleAddContent={handleAddContent}
                                        handleDeleteContent={handleDeleteContent}
                                        variant="outline"
                                        className="w-full h-11 justify-center gap-2 text-sm"
                                    />
                                </div>
                            </section>

                            <section className="space-y-2">
                                <p className="px-1 text-xs text-muted-foreground">Privacy</p>
                                <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                                    <div>
                                        <div className="text-xs font-medium">{isPublic ? "Public" : "Private"}</div>
                                        <p className="text-[11px] text-muted-foreground">{isPublic ? "Anyone with the link can view it." : "Only you can view it."}</p>
                                    </div>
                                    <Switch checked={isPublic} disabled={isLoading} onCheckedChange={handleTogglePublic} aria-label="Toggle resume visibility" />
                                </div>
                                {isPublic && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link href={`/${uuidToShort(resumeId)}`} target="_blank" className="w-full">
                                            <Button variant="outline" className="w-full justify-center gap-2">
                                                <PiArrowSquareOut className="size-4" /> View
                                            </Button>
                                        </Link>
                                        <Button onClick={handleCopyToClipboard} variant="outline" className="w-full justify-center gap-2">
                                            <PiCopySimple className="size-4" /> Copy link
                                        </Button>
                                    </div>
                                )}
                            </section>

                            <section className="space-y-2">
                                <p className="px-1 text-xs text-muted-foreground">Actions</p>
                                <Button onClick={handlePrintResume} variant="outline" className="w-full h-11 justify-center gap-3">
                                    <PiDownloadSimple className="size-5" /> Download resume
                                </Button>
                                <JsonButton contentStates={contentStates} variant="outline" />
                                <div className="grid grid-cols-2 gap-2">
                                    <ConfirmationPopover
                                        button={
                                            <Button variant="outline" className="w-full h-11 justify-center gap-2">
                                                <PiFileText className="size-5" /> Dummy data
                                            </Button>
                                        }
                                        handleConfirm={() => handleApplyResumeData("fake")}
                                        description="Your resume will be overwritten by the fake data if you continue."
                                        title="Are you sure?"
                                    />
                                    <ConfirmationPopover
                                        button={
                                            <Button variant="outline" className="w-full h-11 justify-center gap-2">
                                                <PiFileX className="size-5" /> Clear resume
                                            </Button>
                                        }
                                        handleConfirm={() => handleApplyResumeData("empty")}
                                        description="Your resume will be overwritten by the empty resume if you continue."
                                        title="Are you sure?"
                                    />
                                </div>
                                <ConfirmationPopover
                                    button={
                                        <Button variant="destructive" className="w-full h-11 justify-center gap-3">
                                            <PiTrash className="size-5" /> Delete resume
                                        </Button>
                                    }
                                    handleConfirm={handleDeleteResume}
                                    description="Your resume will deleted forever if you continue."
                                    title="Are you sure?"
                                />
                            </section>
                        </div>
                    </DrawerContent>
                </Drawer>

                <div className="flex items-center gap-1 rounded-full border bg-background/95 p-1.5 shadow-lg backdrop-blur">
                    <StructureButton
                        contentStates={contentStates}
                        handleAddContent={handleAddContent}
                        handleDeleteContent={handleDeleteContent}
                        variant="ghost"
                        iconOnly
                        className="size-11 rounded-full text-muted-foreground hover:text-foreground"
                    />
                    {isPublic && (
                        <Button
                            onClick={handleCopyToClipboard}
                            size="icon"
                            variant="ghost"
                            className="size-11 rounded-full text-muted-foreground hover:text-foreground"
                            aria-label="Copy resume link">
                            <PiCopySimple className="size-5" />
                        </Button>
                    )}
                    <AiButton contentStates={contentStates} resumeId={resumeId} icon />
                    <Button
                        onClick={handlePrintResume}
                        size="icon"
                        variant="ghost"
                        className="size-11 rounded-full text-muted-foreground hover:text-foreground"
                        aria-label="Download resume">
                        <PiDownloadSimple className="size-5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="size-11 rounded-full text-muted-foreground hover:text-foreground"
                        aria-label="Open settings"
                        onClick={() => setIsOpen(true)}>
                        <PiDotsThreeVertical className="size-5" />
                    </Button>
                </div>
            </div>

            <ResumePrint contentStates={contentStates} settingsStates={settingsStates} ref={printRef} />
        </>
    )
}
