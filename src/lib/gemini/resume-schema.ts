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

export const aiRequestSchema = z.object({
    payload: z.array(partialResumeItemSchema),
    userPrompt: z.string().trim().min(1).max(10000),
    resumeId: z.string().uuid(),
})

export type ResumePayload = z.infer<typeof resumeSchema>
