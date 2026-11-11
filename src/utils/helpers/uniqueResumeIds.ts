import {ContentStateType} from "@/app/(protected)/resume/[resume_id]/_static/type"

/**
 * Give every block / entry / link a unique, non-empty id. Existing unique ids are kept,
 * so normal edits round-trip unchanged; only AI-added (imported) items get fresh ones.
 */
export const uniqueResumeIds = <T extends ContentStateType>(resume: T[]): T[] => {
    const seen = new Set<string>()
    const fix = <I extends {id: string}>(item: I): I => {
        const id = item.id && !seen.has(item.id) ? item.id : crypto.randomUUID()
        seen.add(id)
        return {...item, id}
    }

    return resume.map((block) => {
        const b = fix(block as ContentStateType)
        if (b.type === "header") return {...b, links: b.links.map(fix)} as T
        if (b.type === "skill") return {...b, skill: b.skill.map(fix)} as T
        if (b.type === "general") return {...b, general: b.general.map((g) => ({...fix(g), links: g.links.map(fix)}))} as T
        return b as T
    })
}
