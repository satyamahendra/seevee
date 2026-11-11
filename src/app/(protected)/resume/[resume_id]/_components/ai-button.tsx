import {Button} from "@/components/ui/button"
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Textarea} from "@/components/ui/textarea"
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field"
import {useEffect, useRef, useState} from "react"
import {Controller, useForm, useWatch} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {PiArrowCounterClockwise, PiCheck, PiCircleDashed, PiFilePdf, PiMagicWandFill, PiSparkle, PiTrash, PiX} from "react-icons/pi"
import {ContentStateType, ContentStatesType} from "../_static/type"
import {AiTailorFormValues, FOCUS_OPTIONS, MAX_PDF_BYTES, MAX_REQUEST_CHARS, aiTailorSchema, hasResumeContent} from "../_static/ai-schema"
import {toast} from "sonner"
import {useRouter} from "next/navigation"
import {getUserCredits} from "@/actions/userCredits"
import {parse} from "best-effort-json-parser"
import {cn} from "@/lib/utils"
import type {ServerResult} from "@/utils/types/server-action"
import {matchKeywords} from "@/utils/helpers/keywordMatch"
import type {AiOutput} from "@/lib/gemini/resume-schema"

type AiButtonProps = {
    contentStates: ContentStatesType
    resumeId: string
    className?: string
    icon?: boolean
}

type AiRequestBody = {
    payload: ContentStateType[]
    resumeId: string
    request: string
    focus: string[]
    file: {name: string; mime: string; base64: string} | null
}

type Review = {previous: ContentStateType[]; changes: AiOutput["changes"]; keywords: string[]}

const blockLabel = (block: ContentStateType | undefined) =>
    !block ? "Section" : block.type === "header" ? "Header" : block.type === "summary" ? "Summary" : block.type === "skill" ? "Skills" : block.title || "Section"

const DEFAULT_VALUES: AiTailorFormValues = {request: "", focus: [], file: null}

const JD_HINT_THRESHOLD = 400

export default function AiButton({contentStates, resumeId, className, icon = false}: AiButtonProps) {
    const router = useRouter()
    const {content, setContent, isAiGenerating, setIsAiGenerating} = contentStates
    // State updates land a render late; the ref blocks a double-click inside that gap.
    const inFlight = useRef(false)

    const [open, setOpen] = useState(false)
    const [isReadingFile, setIsReadingFile] = useState(false)
    // Stays open after a run so the user can see, revert, or keep what the AI changed.
    const [review, setReview] = useState<Review | null>(null)

    const form = useForm<AiTailorFormValues>({
        resolver: zodResolver(aiTailorSchema),
        defaultValues: DEFAULT_VALUES,
    })

    const request = useWatch({control: form.control, name: "request"})
    const focus = useWatch({control: form.control, name: "focus"}) ?? []
    const file = useWatch({control: form.control, name: "file"})

    // Clear the form whenever the dialog closes.
    useEffect(() => {
        if (!open) form.reset(DEFAULT_VALUES)
    }, [open, form])

    const isBlank = !hasResumeContent(content)
    const trimmedRequest = request?.trim() ?? ""
    const canSubmit = !isAiGenerating && !isReadingFile && Boolean(trimmedRequest || file || (!isBlank && focus.length > 0))

    // Tell the user what the AI understood, so intent never has to be picked from a menu.
    const hint = file
        ? isBlank
            ? "Importing from your PDF"
            : trimmedRequest
              ? "Merging your PDF and applying your instructions"
              : "Merging your PDF into this resume"
        : isBlank && trimmedRequest
          ? "Writing a new resume from your description"
          : trimmedRequest.length > JD_HINT_THRESHOLD
          ? "Tailoring to the pasted job description"
          : trimmedRequest
            ? "Applying your instructions"
            : focus.length > 0 && !isBlank
              ? `Applying ${focus.length} focus area${focus.length > 1 ? "s" : ""}`
              : ""

    const handleGenerateResumeStream = async (body: AiRequestBody) => {
        // body.payload is the content captured when the form was submitted, before any stream chunk lands.
        if (inFlight.current) return
        inFlight.current = true
        const previous = body.payload
        setReview(null)
        setIsAiGenerating(true)
        // Close + toast before fetch: the response only arrives after the model's first token (~seconds of thinking).
        setOpen(false)
        const toastId = toast.loading(
            <div className="flex items-center gap-2 ">
                <PiMagicWandFill className="text-xl" color="#60A5FA" />
                Generating your resume...
            </div>,
        )

        try {
            const response = await fetch(`/api/resume/ai`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            })

            // Errors before streaming starts (auth, validation, credits) come back as a plain ServerResult.
            if (!response.ok || !response.body) {
                const error = (await response.json().catch(() => null)) as ServerResult<null> | null
                throw new Error(error?.message ?? "Resume generation is temporarily unavailable")
            }

            // NDJSON: {"delta"} lines while the model writes, then one ServerResult line.
            const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
            let buffer = ""
            let text = ""
            let result = null as ServerResult<AiOutput> | null

            while (true) {
                const {done, value} = await reader.read()
                if (done) break
                const lines = (buffer + value).split("\n")
                buffer = lines.pop() ?? ""
                for (const line of lines.filter(Boolean)) {
                    const message = JSON.parse(line) as {delta: string} | {reset: true} | ServerResult<AiOutput>
                    if ("delta" in message) text += message.delta
                    else if ("reset" in message) {
                        // The server is retrying from scratch; drop the dead attempt's partial preview.
                        text = ""
                        setContent(previous)
                    } else result = message
                }
                const preview = parse(text) as Partial<AiOutput> | undefined
                // The last streamed block is usually half-written and crashes renderers; show only finished ones.
                if (!result && Array.isArray(preview?.resume) && preview.resume.length > 1) setContent(preview.resume.slice(0, -1) as ContentStateType[])
            }

            if (!result) throw new Error("Connection lost. Reload to check whether your resume was updated.")
            if (!result.success) throw new Error(result.message)

            const next = result.data.resume as ContentStateType[]
            setContent(next)
            setReview({
                previous,
                changes: result.data.changes.filter((change) => next.some((block) => block.id === change.blockId)),
                keywords: result.data.keywords.filter((keyword) => keyword.trim()).slice(0, 30),
            })
            toast.success(result.message, {id: toastId})
            form.reset(DEFAULT_VALUES)
        } catch (error) {
            // Never leave a half-streamed resume on screen (or in autosave).
            setContent(previous)
            toast.error(error instanceof Error ? error.message : "Something went wrong while generating resume.", {id: toastId})
        } finally {
            inFlight.current = false
            setIsAiGenerating(false)
        }
    }

    const onSubmit = (values: AiTailorFormValues) => {
        void handleGenerateResumeStream({
            resumeId,
            payload: content,
            request: values.request,
            focus: values.focus,
            file: values.file,
        })
    }

    const handleOpenModal = async () => {
        const response = await getUserCredits()
        if (response.error) return toast.error(response.error)
        if (response.data) {
            if (response.data.totalCredits < 1) {
                toast.error("You're out of credits. Top up to use AI Assist.")
                return router.push("/")
            }
            setOpen(true)
        }
    }

    const revertBlock = (id: string) => {
        if (!review) return
        const old = review.previous.find((block) => block.id === id)
        // A block the AI added (PDF import) has no previous version, so reverting removes it.
        setContent((current) => (old ? current.map((block) => (block.id === id ? old : block)) : current.filter((block) => block.id !== id)))
        setReview({...review, changes: review.changes.filter((change) => change.blockId !== id)})
    }

    const undoAll = () => {
        if (review) setContent(review.previous)
        setReview(null)
    }

    const handlePickFile = async (picked: File | undefined) => {
        if (!picked) return
        if (picked.type !== "application/pdf") return form.setError("file", {message: "Only PDF files are supported"})
        if (picked.size > MAX_PDF_BYTES) return form.setError("file", {message: "File is too large (max 4MB)"})
        form.clearErrors("file")
        setIsReadingFile(true)
        try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => {
                    const result = reader.result as string
                    const idx = result.indexOf(",")
                    resolve(idx >= 0 ? result.slice(idx + 1) : result)
                }
                reader.onerror = reject
                reader.readAsDataURL(picked)
            })
            form.setValue("file", {name: picked.name, mime: "application/pdf", base64}, {shouldValidate: true})
        } catch {
            form.setError("file", {message: "Could not read that file"})
        } finally {
            setIsReadingFile(false)
        }
    }

    // Recomputed from live content, so reverts and manual edits update the score.
    const match = review && review.keywords.length > 0 ? {before: matchKeywords(review.previous, review.keywords), now: matchKeywords(content, review.keywords)} : null

    return (
        <>
            <Button
                disabled={isAiGenerating}
                onClick={handleOpenModal}
                size={icon ? "icon" : "sm"}
                aria-label={icon ? "AI Tailor" : undefined}
                className={
                    icon ? "relative size-11 rounded-full bg-blue-400 duration-200 hover:bg-blue-500" : `relative w-24 bg-blue-400 duration-200 hover:bg-blue-500 ${className ?? "w-full"}`
                }>
                {isAiGenerating || icon ? null : "AI Tailor"}
                {isAiGenerating ? <PiCircleDashed className="animate-spin" /> : <PiMagicWandFill />}
                {!icon && (
                    <>
                        <div className="w-3 h-3 bg-brand rounded-xs rotate-45 aspect-square absolute -top-1 -right-1"></div>
                        <div className="w-3 h-3 bg-brand rounded-xs rotate-45 aspect-square absolute -top-1 -right-1 animate-ping"></div>
                    </>
                )}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
                    <DialogHeader className="flex-row items-center gap-3 border-b p-5 pr-12">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                            <PiMagicWandFill className="text-xl text-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-base">AI Assist</DialogTitle>
                            <DialogDescription className="text-xs">
                                {isBlank
                                    ? "This resume is empty. Describe the one you want, or upload your old PDF."
                                    : "Tell me what to change, paste a job description, or merge in your old resume."}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-5">
                        <form id="ai-tailor-form" onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} noValidate>
                            <FieldGroup className="gap-5">
                                <Controller
                                    name="request"
                                    control={form.control}
                                    render={({field, fieldState}) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>What should change?</FieldLabel>
                                            <Textarea
                                                {...field}
                                                id={field.name}
                                                autoFocus
                                                aria-invalid={fieldState.invalid}
                                                maxLength={MAX_REQUEST_CHARS}
                                                placeholder={
                                                    isBlank
                                                        ? "e.g. “an example resume for a senior backend engineer”"
                                                        : "Paste a job description, or tell me what to fix — e.g. “make it shorter, focus on backend roles”"
                                                }
                                                className="h-40 resize-none"
                                            />
                                            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    {hint && (
                                                        <>
                                                            <PiSparkle className="text-blue-500" />
                                                            {hint}
                                                        </>
                                                    )}
                                                </span>
                                                <span className="tabular-nums">
                                                    {trimmedRequest.length}/{MAX_REQUEST_CHARS}
                                                </span>
                                            </div>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="focus"
                                    control={form.control}
                                    render={({field, fieldState}) => {
                                        const selected = field.value ?? []
                                        return (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel>
                                                    Focus <span className="font-normal text-muted-foreground">(optional)</span>
                                                </FieldLabel>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {FOCUS_OPTIONS.map((preset) => {
                                                        const active = selected.includes(preset)
                                                        return (
                                                            <button
                                                                key={preset}
                                                                type="button"
                                                                aria-pressed={active}
                                                                onClick={() =>
                                                                    field.onChange(active ? selected.filter((item) => item !== preset) : [...selected, preset])
                                                                }
                                                                className={cn(
                                                                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                                                                    active
                                                                        ? "border-blue-500/50 bg-blue-500/10 text-foreground"
                                                                        : "text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                                                                )}>
                                                                {active && <PiCheck className="size-3 text-blue-500" />}
                                                                {preset}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )
                                    }}
                                />

                                <Controller
                                    name="file"
                                    control={form.control}
                                    render={({field, fieldState}) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel>
                                                Existing resume <span className="font-normal text-muted-foreground">(optional, PDF)</span>
                                            </FieldLabel>
                                            <div
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg border border-dashed p-3 transition-colors",
                                                    field.value ? "border-emerald-500/50 bg-emerald-500/5" : "border-muted-foreground/25 hover:border-foreground/30",
                                                )}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => {
                                                    e.preventDefault()
                                                    void handlePickFile(e.dataTransfer.files?.[0])
                                                }}>
                                                <input
                                                    id="ai-pdf-input"
                                                    type="file"
                                                    accept="application/pdf"
                                                    className="peer sr-only"
                                                    onChange={(e) => {
                                                        void handlePickFile(e.target.files?.[0])
                                                        e.target.value = "" // lets the same file be re-picked after Remove
                                                    }}
                                                />
                                                <label
                                                    htmlFor="ai-pdf-input"
                                                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                                                    <div
                                                        className={cn(
                                                            "flex size-10 shrink-0 items-center justify-center rounded-md",
                                                            field.value ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500",
                                                        )}>
                                                        {isReadingFile ? <PiCircleDashed className="animate-spin text-xl" /> : <PiFilePdf className="text-xl" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">{field.value?.name ?? "Drop a PDF or click to upload"}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {isReadingFile ? "Reading file..." : "Max 4MB · the file is never stored"}
                                                        </p>
                                                    </div>
                                                </label>
                                                {field.value && (
                                                    <Button type="button" variant="ghost" size="icon" aria-label="Remove PDF" onClick={() => field.onChange(null)}>
                                                        <PiTrash />
                                                    </Button>
                                                )}
                                            </div>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </form>
                    </div>

                    <DialogFooter className="border-t bg-muted/30 p-4 sm:items-center">
                        <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" form="ai-tailor-form" disabled={!canSubmit} className="bg-blue-500 hover:bg-blue-600 sm:min-w-44">
                            {isReadingFile ? (
                                <>
                                    Reading file... <PiCircleDashed className="animate-spin" />
                                </>
                            ) : (
                                <>
                                    <PiMagicWandFill />
                                    Work your magic
                                    <span className="ml-1 flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-xs" aria-label="costs 1 credit">
                                        -1<span className="size-1.5 rotate-45 bg-white" />
                                    </span>
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {review && (
                <div
                    role="dialog"
                    aria-label="AI changes"
                    className="fixed right-4 bottom-4 z-50 flex max-h-[70dvh] w-[min(calc(100vw-2rem),24rem)] flex-col gap-3 rounded-xl border bg-background p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                        <p className="flex items-center gap-2 font-medium">
                            <PiMagicWandFill className="text-blue-500" /> AI changes
                        </p>
                        <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setReview(null)}>
                            <PiX />
                        </Button>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto">
                        {review.changes.length === 0 && <p className="text-xs text-muted-foreground">No block-level notes for this run.</p>}
                        {review.changes.map((change) => (
                            <div key={change.blockId} className="flex items-start gap-2 rounded-lg border p-2">
                                <div className="flex-1">
                                    <p className="text-xs font-medium">
                                        {blockLabel(content.find((block) => block.id === change.blockId))}
                                        {!review.previous.some((block) => block.id === change.blockId) && (
                                            <span className="ml-1 font-normal text-muted-foreground">(new)</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{change.summary}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => revertBlock(change.blockId)}>
                                    <PiArrowCounterClockwise /> Revert
                                </Button>
                            </div>
                        ))}

                        {match && (
                            <div className="rounded-lg border p-2">
                                <p className="text-xs text-muted-foreground">Job keyword match</p>
                                <p className="text-sm font-medium">
                                    {match.before.found.length} → {match.now.found.length} of {match.now.total}
                                    <span className="ml-1 font-normal text-muted-foreground">
                                        ({Math.round((match.now.found.length / match.now.total) * 100)}%)
                                    </span>
                                </p>
                            </div>
                        )}

                        {match && match.now.missing.length > 0 && (
                            <div className="space-y-1.5">
                                <p className="text-xs font-medium">The job asks for these. Add them if they&apos;re true for you:</p>
                                <div className="flex flex-wrap gap-1">
                                    {match.now.missing.map((keyword) => (
                                        <span key={keyword} className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={undoAll}>
                            Undo all
                        </Button>
                        <Button className="flex-1" onClick={() => setReview(null)}>
                            <PiCheck /> Keep
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
}
