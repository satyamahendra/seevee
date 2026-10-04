"use client"

import {Button} from "@/components/ui/button"
import React from "react"
import {PiArrowSquareOut, PiCopySimple, PiFileText, PiFileX, PiTrash} from "react-icons/pi"
import AiButton from "./ai-button"
import {ContentStatesType, FontStylesType, HandleAddContentType, HandleDeleteContentType, SettingsStatesType} from "../_static/type"
import {fontStyles} from "../_static/var"
import Link from "next/link"
import StructureButton from "./structure-button"
import ConfirmationPopover from "@/components/custom/confirmation-popover"
import {Switch} from "@/components/ui/switch"
import {Label} from "@/components/ui/label"
import {uuidToShort} from "@/util/helpers/shortenResumeID"
import JsonButton from "./json-button"

type MenuActionsProps = {
    contentStates: ContentStatesType
    settingsStates: SettingsStatesType
    resumeId: string
    handleAddContent: HandleAddContentType
    handleDeleteContent: HandleDeleteContentType
    isPublic: boolean
    isLoading: boolean
    handleTogglePublic: () => Promise<void>
    handleCopyToClipboard: () => void
    handleApplyResumeData: (type: "fake" | "empty") => void
    handleDeleteResume: () => Promise<void>
    showFont?: boolean
}

export default function MenuActions({
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
    showFont = false,
}: MenuActionsProps) {
    const {selectedFontStyle, setSelectedFontStyle} = settingsStates

    return (
        <div className="flex flex-col gap-1 w-full">
            {showFont && (
                <div className="rounded-xl border bg-card p-2 shadow-sm">
                    <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Font style</p>
                    <div className="grid grid-cols-2 gap-1.5">
                        {fontStyles.map((fs) => (
                            <Button
                                key={fs}
                                type="button"
                                size="sm"
                                variant={selectedFontStyle === fs ? "secondary" : "ghost"}
                                className={`h-9 justify-start px-3 text-sm ${selectedFontStyle === fs ? "ring-1 ring-primary/30" : ""} font-${fs}`}
                                onClick={() => setSelectedFontStyle(fs as FontStylesType)}
                                aria-pressed={selectedFontStyle === fs}
                            >
                                {fs.charAt(0).toUpperCase() + fs.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-2 flex flex-col items-center gap-2 rounded-lg bg-muted/50">
                <AiButton contentStates={contentStates} resumeId={resumeId} />
            </div>

            <StructureButton contentStates={contentStates} handleAddContent={handleAddContent} handleDeleteContent={handleDeleteContent} />

            <div className="my-2 border-b"></div>

            <div className="flex items-center gap-2 px-1">
                <Switch id="is-resume-public" className="scale-75" disabled={isLoading} checked={isPublic} onCheckedChange={handleTogglePublic} />
                <Label htmlFor="is-resume-public" className="text-xs">
                    {isPublic ? "Public" : "Private"}
                </Label>
            </div>
            <p className="text-[11px] text-muted-foreground px-2">{isPublic ? "Everyone with the link can view it." : "Only you can view it."}</p>
            {isPublic && (
                <div className="flex gap-1 w-full">
                    <Link href={`/${uuidToShort(resumeId)}`} target="_blank" className="w-full">
                        <Button className="text-xs h-7 w-full" variant="secondary">
                            <PiArrowSquareOut />
                            Open
                        </Button>
                    </Link>
                    <Button onClick={handleCopyToClipboard} className="text-xs h-7" variant="secondary">
                        <PiCopySimple /> Copy
                    </Button>
                </div>
            )}

            <div className="my-2 border-b"></div>

            <ConfirmationPopover
                button={
                    <Button size="sm" variant="ghost" className="w-full h-10 flex justify-start gap-3 rounded-lg px-3 text-sm">
                        <PiFileText />
                        Apply fake data
                    </Button>
                }
                handleConfirm={() => handleApplyResumeData("fake")}
                description="Your resume will be overwritten by the fake data if you continue."
                title="Are you sure?"
            />
            <ConfirmationPopover
                button={
                    <Button size="sm" variant="ghost" className="w-full h-10 flex justify-start gap-3 rounded-lg px-3 text-sm">
                        <PiFileX />
                        Clear resume
                    </Button>
                }
                handleConfirm={() => handleApplyResumeData("empty")}
                description="Your resume will be overwritten by the empty resume if you continue."
                title="Are you sure?"
            />
            <JsonButton contentStates={contentStates} />

            <div className="my-3 border-b" />

            <ConfirmationPopover
                button={
                    <Button size="sm" variant="ghost" className="w-full h-10 text-destructive flex justify-start gap-3 rounded-lg px-3 text-sm hover:bg-destructive/10 hover:text-destructive">
                        <PiTrash />
                        Delete resume
                    </Button>
                }
                handleConfirm={handleDeleteResume}
                description="Your resume will deleted forever if you continue."
                title="Are you sure?"
            />
        </div>
    )
}