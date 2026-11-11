// Fields that never hold resume wording, so they must not count as a keyword hit.
const SKIP_KEYS = new Set(["id", "type", "url", "icon", "startDate", "endDate"])

const textOf = (value: unknown, key = ""): string[] => {
    if (typeof value === "string") return SKIP_KEYS.has(key) ? [] : [value]
    if (Array.isArray(value)) return value.flatMap((item) => textOf(item, key))
    if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => textOf(v, k))
    return []
}

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Whole-term, case-insensitive match of JD keywords against the resume's text,
 * so "Java" does not count for "JavaScript" and "Go" does not count for "good".
 */
export const matchKeywords = (resume: unknown, keywords: string[]) => {
    const text = textOf(resume).join("\n")
    const trimmed = keywords.map((k) => k.trim()).filter(Boolean)
    // Keep the first spelling: the model lists required terms first, in the job's casing.
    const unique = trimmed.filter((k, i) => trimmed.findIndex((other) => other.toLowerCase() === k.toLowerCase()) === i)
    const found = unique.filter((k) => new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(k)}(?![\\p{L}\\p{N}])`, "iu").test(text))
    return {total: unique.length, found, missing: unique.filter((k) => !found.includes(k))}
}
