import {z} from "zod"
import {ContentStateType} from "./type"

export const FOCUS_OPTIONS = [
    "Keep it to one page",
    "Stronger action verbs",
    "Quantify results",
    "ATS keywords",
    "Fix grammar",
    "Concise bullets",
] as const

export type FocusOption = (typeof FOCUS_OPTIONS)[number]

// Token guards: hard caps on everything the user can push into the prompt.
export const MAX_REQUEST_CHARS = 12_000
export const MAX_PDF_BYTES = 4 * 1024 * 1024
const MAX_BASE64_CHARS = Math.ceil((MAX_PDF_BYTES * 4) / 3) + 1024

export const aiTailorSchema = z
    .object({
        request: z.string().trim().max(MAX_REQUEST_CHARS, `Request is too long (max ${MAX_REQUEST_CHARS.toLocaleString()} characters)`),
        focus: z.array(z.enum(FOCUS_OPTIONS)).max(FOCUS_OPTIONS.length),
        file: z
            .object({
                name: z.string().min(1).max(255),
                mime: z.literal("application/pdf"),
                base64: z.string().min(1).max(MAX_BASE64_CHARS, "PDF is too large (max 4MB)"),
            })
            .nullable(),
    })
    .superRefine((value, ctx) => {
        if (!value.request && !value.file && value.focus.length === 0) {
            ctx.addIssue({code: "custom", path: ["request"], message: "Type an instruction, pick a focus, or add your PDF"})
        }
    })

export type AiTailorFormValues = z.infer<typeof aiTailorSchema>

/**
 * A resume is "empty" until at least one real value exists. Block ids and
 * types alone do not count, otherwise a blank template looks populated.
 */
export const hasResumeContent = (content: ContentStateType[]) =>
    content.some((block) => {
        if (block.type === "header") return Boolean(block.fullname || block.email || block.phone || block.city || block.country)
        if (block.type === "summary") return Boolean(block.text)
        if (block.type === "skill") return block.skill.some((skill) => skill.name || skill.items.some(Boolean))
        return block.general.some((item) => item.title || item.subtitle || item.description || item.bulletpoints.some(Boolean) || item.tags.length > 0)
    })
