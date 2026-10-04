"use server"

import prisma from "@/lib/prisma/client"
import {revalidatePath} from "next/cache"
import {ServerResult} from "@/utils/types/server-action"
import {authServer} from "@/lib/auth-server"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {CRUD_ACTIONS} from "../../roles/utils/permission-matrix"
import {requirePermissions} from "@/utils/helpers/has-ability-server"

export async function createPermissionsFromAttribute(attribute: string): Promise<ServerResult<null>> {
    const trimmed = attribute.trim().toLowerCase()

    if (!trimmed || /\s/.test(trimmed)) {
        return {success: false, data: null, message: "Enter a single attribute name (e.g. users)"}
    }

    try {
        const session = await authServer()
        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["create permissions", "manage permissions"])

        const names = CRUD_ACTIONS.map((action) => `${action} ${trimmed}`)

        const existing = await prisma.permission.findMany({
            where: {name: {in: names}},
            select: {name: true},
        })
        const existingSet = new Set(existing.map((p) => p.name))
        const missing = names.filter((name) => !existingSet.has(name))

        if (missing.length > 0) {
            await prisma.permission.createMany({data: missing.map((name) => ({name}))})
        }

        revalidatePath("/permissions")
        if (missing.length === 0) {
            return {success: true, data: null, message: `All permissions for "${trimmed}" already exist`}
        }
        const added = missing.map((name) => name.replace(` ${trimmed}`, "")).join(", ")
        return {success: true, data: null, message: `Added ${added} permission${missing.length > 1 ? "s" : ""} for "${trimmed}"`}
    } catch (error) {
        return handleServerError(error)
    }
}
