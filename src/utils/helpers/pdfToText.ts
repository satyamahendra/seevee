import {extractText} from "unpdf"

/**
 * Extract plain text from a base64 PDF, page-merged.
 * Returns "" when extraction fails - callers just send the resume without the attachment.
 */
export async function pdfToText(base64: string): Promise<string> {
    try {
        const bytes = new Uint8Array(Buffer.from(base64, "base64"))
        const {text} = await extractText(bytes, {mergePages: true})
        return (text || "").trim()
    } catch (error) {
        console.error("pdfToText failed:", error instanceof Error ? error.message : error)
        return ""
    }
}
