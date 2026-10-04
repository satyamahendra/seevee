import {GoogleGenAI} from "@google/genai"

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured")
}

export const gemini = new GoogleGenAI({apiKey})
const configuredModel = process.env.GEMINI_MODEL?.trim()
export const geminiModel = configuredModel && configuredModel !== "gemini-2.5-flash" ? configuredModel : "gemini-3.8-flash"
