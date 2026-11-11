import {z} from "zod"

const linkSchema = z.object({
    id: z.string(),
    icon: z.string().optional(),
    name: z.string(),
    url: z.string(),
})

const headerSchema = z.object({
    id: z.string(),
    type: z.literal("header"),
    fullname: z.string(),
    city: z.string(),
    country: z.string(),
    email: z.string(),
    phone: z.string(),
    links: z.array(linkSchema),
})

const skillSchema = z.object({
    id: z.string(),
    name: z.string(),
    items: z.array(z.string()),
})

const skillContentSchema = z.object({
    id: z.string(),
    type: z.literal("skill"),
    skill: z.array(skillSchema),
})

const summarySchema = z.object({
    id: z.string(),
    type: z.literal("summary"),
    text: z.string(),
})

const generalSchema = z.object({
    id: z.string(),
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    bulletpoints: z.array(z.string()),
    tags: z.array(z.string()),
    city: z.string(),
    country: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    links: z.array(linkSchema),
})

const generalContentSchema = z.object({
    id: z.string(),
    type: z.literal("general"),
    title: z.string(),
    general: z.array(generalSchema),
})

export const resumeSchema = z.array(z.discriminatedUnion("type", [headerSchema, skillContentSchema, summarySchema, generalContentSchema]))

const partialResumeItemSchema = z
    .object({
        id: z.string().optional(),
        type: z.enum(["header", "skill", "summary", "general"]).optional(),
    })
    .passthrough()

// Token guards - mirror the client schema and cap the PDF payload.
export const AI_LIMITS = {
    payloadItems: 200,
    request: 12_000,
    focusItems: 8,
    fileBase64: 6_000_000,
    pdfText: 20_000,
} as const

const fileSchema = z
    .object({
        name: z.string().min(1).max(255),
        mime: z.literal("application/pdf"),
        base64: z.string().min(1).max(AI_LIMITS.fileBase64),
    })
    .nullish()

export const aiRequestSchema = z
    .object({
        payload: z.array(partialResumeItemSchema).max(AI_LIMITS.payloadItems),
        request: z.string().trim().max(AI_LIMITS.request).optional().default(""),
        focus: z.array(z.string().trim().max(80)).max(AI_LIMITS.focusItems).optional().default([]),
        resumeId: z.string().uuid(),
        file: fileSchema,
    })
    .refine((value) => value.request.length > 0 || value.focus.length > 0 || Boolean(value.file?.base64), {
        message: "A request, a focus area, or a PDF is required",
    })

export type ResumePayload = z.infer<typeof resumeSchema>

// What the model returns. `resume` comes first so the client can stream it into the preview.
export const aiOutputSchema = z.object({
    resume: resumeSchema,
    changes: z.array(z.object({blockId: z.string(), summary: z.string()})),
    // Every important JD term; the client computes which ones the resume covers.
    keywords: z.array(z.string()),
})

export type AiOutput = z.infer<typeof aiOutputSchema>

// Gemini's structured output takes a JSON Schema subset: no `$schema`, and `enum` instead of `const`.
const aiOutputJson = z.toJSONSchema(aiOutputSchema, {
    override: ({jsonSchema}) => {
        if (jsonSchema.const !== undefined) {
            jsonSchema.enum = [jsonSchema.const]
            delete jsonSchema.const
        }
    },
})
delete aiOutputJson.$schema
export const aiOutputJsonSchema = {...aiOutputJson, propertyOrdering: ["resume", "changes", "keywords"]}
