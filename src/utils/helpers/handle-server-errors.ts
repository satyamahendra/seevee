// lib/handle-error.ts

import {Prisma} from "@/generated/index"
import {ZodError} from "zod"
import {ServerErrorResult} from "@/utils/types/server-action"
import Midtrans from "midtrans-client"
import axios, {AxiosError} from "axios"

type ClassifiedError = {
    message: string
    status: number
    errors?: Record<string, string[]>
}

// ─── Core classifier ──────────────────────────────────────────────────────────

function classifyPrisma(error: Prisma.PrismaClientKnownRequestError): {
    message: string
    errors?: Record<string, string[]>
} {
    switch (error.code) {
        case "P2002": {
            const raw = error.meta?.target
            const fields: string[] = Array.isArray(raw)
                ? raw
                : typeof raw === "string"
                ? [raw.replace(/.*_([^_]+)_key$/, "$1")] // "Role_name_key" → "name"
                : ["field"]

            return {
                message: `A record with this ${fields.join(", ")} already exists.`,
                errors: Object.fromEntries(fields.map((f) => [f, ["Already taken."]])),
            }
        }
        case "P2025":
            return {message: "Record not found."}
        case "P2003": {
            const field = (error.meta?.field_name as string) ?? "relation"
            return {
                message: "Related record not found.",
                errors: {[field]: ["Does not exist."]},
            }
        }
        case "P2014":
            return {message: "The change violates a required relation."}
        case "P2016":
            return {message: "Query interpretation error."}
        default:
            return {message: `Database error. (${error.code})`}
    }
}

function classifyMidtrans(error: Midtrans.MidtransError): {
    message: string
    errors?: Record<string, string[]>
} {
    const apiResponse = error.ApiResponse as Record<string, unknown> | undefined

    const statusMessage =
        typeof apiResponse?.status_message === "string"
            ? apiResponse.status_message
            : Array.isArray(apiResponse?.error_messages) && apiResponse.error_messages.length > 0
            ? (apiResponse.error_messages as string[]).join(", ")
            : error.message

    return {
        message: statusMessage,
        errors: apiResponse ? {api: (apiResponse.error_messages as string[]) ?? [JSON.stringify(apiResponse)]} : undefined,
    }
}

function classifyAxios(error: AxiosError): {
    message: string
    errors?: Record<string, string[]>
} {
    const data = error.response?.data as Record<string, unknown> | undefined
    const message = typeof data?.message === "string" ? data.message : error.message

    return {message, errors: data?.errors as Record<string, string[]> | undefined}
}

export function classifyError(error: unknown): ClassifiedError {
    // Zod
    if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {}
        for (const issue of error.issues) {
            const key = issue.path.join(".") || "_root"
            ;(errors[key] ??= []).push(issue.message)
        }
        return {message: "Validation failed.", status: 422, errors}
    }

    // Prisma — known
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const {message, errors} = classifyPrisma(error)
        return {message, status: 400, errors}
    }

    // Prisma — validation
    if (error instanceof Prisma.PrismaClientValidationError) {
        return {message: "Invalid data provided.", status: 400}
    }

    // Prisma — connection
    if (error instanceof Prisma.PrismaClientInitializationError) {
        return {message: "Database connection failed.", status: 503}
    }

    // Midtrans
    if (error instanceof Midtrans.MidtransError) {
        const {message, errors} = classifyMidtrans(error)
        return {message, status: error.httpStatusCode ?? 500, errors}
    }

    // Axios
    if (axios.isAxiosError(error)) {
        const {message, errors} = classifyAxios(error)
        return {message, status: error.response?.status ?? 500, errors}
    }

    // Native
    if (error instanceof Error) {
        if (error.message === "Unauthorized") return {message: "Unauthorized", status: 401}
        if (error.message === "Forbidden") return {message: "Forbidden", status: 403}
        return {message: error.message, status: 500}
    }

    return {message: "An unexpected error occurred.", status: 500}
}

// ─── ServerResult handler ───────────────────────────────────────────────────

export function handleServerError(error: unknown): ServerErrorResult {
    const {message, status, errors} = classifyError(error)
    return {success: false, data: null, message, status, errors}
}
