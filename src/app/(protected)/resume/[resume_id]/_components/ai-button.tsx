import {Button} from "@/components/ui/button"
import {Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import {Textarea} from "@/components/ui/textarea"
import React, {useState} from "react"
import {PiCircleDashed, PiMagicWand, PiMagicWandFill} from "react-icons/pi"
import {ContentStatesType, ContentStateType} from "../_static/type"
import {toast} from "sonner"
import {useRouter} from "next/navigation"
import {getUserCredits} from "@/actions/userCredits"
import {parse} from "best-effort-json-parser"
import {useScreenSize} from "@/utils/hooks/useScreenSize"

type AiButtonProps = {
    contentStates: ContentStatesType
    resumeId: string
    className?: string
}

export default function AiButton({contentStates, resumeId, className}: AiButtonProps) {
    const router = useRouter()
    const {isMobile} = useScreenSize()
    const {content, setContent} = contentStates

    const [prompt, setPrompt] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)

    const handleOpenModal = async () => {
        setIsLoading(true)
        const response = await getUserCredits()
        if (response.error) {
            toast(response.error)
            return setIsLoading(false)
        }
        if (response.data) {
            if (response.data.totalCredits < 1) {
                router.push("/")
                return setIsLoading(false)
            } else {
                setOpen(true)
                return setIsLoading(false)
            }
        }
    }

    //modify here for the json stream
    const handleGenerateResumeStream = async (resumeId: string, payload: ContentStateType[], userPrompt: string) => {
        setIsLoading(true)

        try {
            const response = await fetch(`/api/resume/ai`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({payload, userPrompt, resumeId}),
            })

            if (!response.ok) {
                const errorBody = (await response.json().catch(() => null)) as {error?: string} | null
                throw new Error(errorBody?.error ?? "Resume generation is temporarily unavailable")
            }

            if (!response.body) throw new Error("No response body")

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let rawText = ""

            if (reader) {
                setOpen(false)
                toast(
                    <div className="flex items-center gap-2 ">
                        <PiMagicWandFill className="text-xl" color="#60A5FA" />
                        Generating your resume...
                    </div>,
                )
            }

            while (true) {
                const {done, value} = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, {stream: true})
                rawText += chunk

                const parsed = parse(rawText)
                if (Array.isArray(parsed)) {
                    setContent(parsed)
                }
            }

            try {
                const finalParsed = JSON.parse(rawText)
                if (Array.isArray(finalParsed)) {
                    setContent(finalParsed)
                    toast.success("Successfully optimized a resume!")
                    setPrompt("")
                    setOpen(false)
                } else {
                    toast("AI response did not return expected format.")
                }
            } catch {
                toast("Failed to parse AI response as JSON.")
            }
        } catch (error) {
            console.error("Resume AI request failed", error)
            toast(error instanceof Error ? error.message : "Something went wrong while generating resume.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Button
                disabled={isLoading}
                onClick={handleOpenModal}
                size="sm"
                className={`relative w-24 bg-blue-400 hover:bg-blue-500 duration-200 ${className ?? "w-full"}`}>
                {isLoading ? null : "AI Tailor"}
                {isLoading ? <PiCircleDashed className="animate-spin" /> : <PiMagicWandFill />}
                <div className="w-3 h-3 bg-blue-300 rounded-xs rotate-45 aspect-square absolute -top-1 -right-1"></div>
                <div className="w-3 h-3 bg-blue-300 rounded-xs rotate-45 aspect-square absolute -top-1 -right-1 animate-ping"></div>
            </Button>

            <Drawer swipeDirection={isMobile ? "down" : "right"} open={open} onOpenChange={setOpen}>
                <DrawerContent className="[--drawer-content-width:min(100dvw,48rem)]">
                    <DrawerHeader className="flex flex-col items-center text-center">
                        <DrawerTitle className="flex flex-col items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg border">
                                <PiMagicWandFill className="text-2xl text-blue-500" />
                            </div>
                            AI Assist
                        </DrawerTitle>
                        <DrawerDescription>
                            Transform your resume instantly. Paste a job description to optimize, request a translation, or give custom instructions. Our AI will handle
                            the rest!
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 w-full">
                        <Textarea
                            id="input"
                            placeholder="How do you want your resume to be?"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="h-75"
                        />
                        <Button
                            className="w-full"
                            disabled={prompt === "" || isLoading}
                            onClick={() => handleGenerateResumeStream(resumeId, content, prompt)}
                            type="submit">
                            {isLoading ? (
                                <>
                                    Doing magic, hang on a sec... <PiCircleDashed className="animate-spin" />
                                </>
                            ) : (
                                <div className="flex items-center gap-4">
                                    Get my resume!
                                    <div className="flex gap-1.5 items-center">
                                        -1<div className="w-2 h-2 rotate-45 bg-primary-foreground"></div>
                                    </div>
                                </div>
                            )}
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    )
}
