"use client"

import {Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import React, {cloneElement, useState} from "react"
import {contentType} from "../_static/var"
import {HandleAddContentType} from "../_static/type"
import {PiBriefcase, PiCrosshair, PiCube, PiFileText, PiTextAlignJustify, PiTextHFill} from "react-icons/pi"
import {useScreenSize} from "@/utils/hooks/useScreenSize"

type ChooseContentButtonProps = {
    children: React.ReactElement<{onClick?: () => void}>
    handleAddContent: HandleAddContentType
}

export default function ChooseContentButton({children, handleAddContent}: ChooseContentButtonProps) {
    const {isMobile} = useScreenSize()
    const [isOpen, setIsOpen] = useState(false)

    const handleToggleOpen = () => setIsOpen((prev) => !prev)

    const childWithClick = cloneElement(children, {
        onClick: handleToggleOpen,
    })

    return (
        <>
            {childWithClick}
            <Drawer swipeDirection={isMobile ? "down" : "right"} open={isOpen} onOpenChange={setIsOpen}>
                <DrawerContent className="[--drawer-content-width:min(100dvw,48rem)]">
                    <DrawerHeader>
                        <DrawerTitle className="flex flex-col items-center gap-4">Choose Content</DrawerTitle>
                        <DrawerDescription className="text-center">Choose your content block to build your resume!</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1 overflow-y-auto p-4 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {contentType.map((con) => (
                                <div
                                    key={con}
                                    onClick={() => {
                                        let title = ""
                                        if (con === "project") title = "Projects"
                                        if (con === "professional") title = "Professional Experiences"
                                        handleAddContent(con, title)
                                        setIsOpen(false)
                                    }}
                                    className="border bg-primary-foreground hover:bg-inherit group p-4 rounded-md space-y-2 hover:scale-[98%] cursor-pointer duration-200">
                                    <div className="border bg-primary-foreground group-hover:bg-muted duration-200 rounded-md w-8 h-8 flex text-xl items-center justify-center">
                                        {con === "header" && <PiTextHFill />}
                                        {con === "general" && <PiFileText />}
                                        {con === "skill" && <PiCrosshair />}
                                        {con === "summary" && <PiTextAlignJustify />}
                                        {con === "project" && <PiCube />}
                                        {con === "professional" && <PiBriefcase />}
                                    </div>
                                    <div className="font-[500]">{con[0].toUpperCase() + con.slice(1)}</div>
                                    <div className="text-muted-foreground text-xs">
                                        {con === "header" && "Showcase your name, title, and key contact details at the top of your resume."}
                                        {con === "general" && "Add sections like education, experience, or custom details to highlight your background."}
                                        {con === "skill" && "List your technical and soft skills in a clean, easy-to-read format."}
                                        {con === "summary" && "Write a short career summary or objective to capture attention at a glance."}
                                        {con === "project" && "Add your personal projects to showcase your skills and experience."}
                                        {con === "professional" && "Add your professional experience to highlight your career history."}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    )
}
