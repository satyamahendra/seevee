import {GoogleGenAI} from "@google/genai"

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured")
}

// The SDK has no timeout or retries by default: an overloaded model (503 / hung socket) left requests pending for minutes.
export const gemini = new GoogleGenAI({apiKey, httpOptions: {timeout: 120_000, retryOptions: {attempts: 3, maxDelay: 4}}})
const configuredModel = process.env.GEMINI_MODEL?.trim()
export const geminiModel = configuredModel && configuredModel !== "gemini-2.5-flash" ? configuredModel : "gemini-3.8-flash"
