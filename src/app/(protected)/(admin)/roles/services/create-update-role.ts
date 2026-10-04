"use server"

import prisma from "@/lib/prisma/client"
import {revalidatePath} from "next/cache"
import {RoleFormSchema, roleSchema} from "../utils/schemas"
import {ServerResult} from "@/utils/types/server-action"
import {Role} from "@/generated/index"
import {authServer} from "@/lib/auth-server"
import {handleServerError} from "@/utils/helpers/handle-server-errors"
import {requirePermissions} from "@/utils/helpers/has-ability-server"

export async function createUpdateRole(data: RoleFormSchema): Promise<ServerResult<Role>> {
    try {
        const parsed = roleSchema.safeParse(data)

        const session = await authServer()
        if (!session) throw new Error("Unauthorized")
        await requirePermissions(["create roles", "update roles", "manage roles"])

        const {name, name_before, permissions = [], is_active} = parsed.data as RoleFormSchema

        let role: Role

        if (name_before) {
            role = await prisma.$transaction(async (tx) => {
                const updated = await tx.role.update({
                    where: {name: name_before},
                    data: {
                        name,
                        is_active,
                        permissions: {
                            deleteMany: {},
                            create: permissions.map((permission_name) => ({permission_name})),
                        },
                    },
                    select: {name: true},
                })

                return updated as Role
            })
        } else {
            role = (await prisma.role.create({
                data: {
                    name,
                    is_active,
                    permissions: {
                        create: permissions.map((permission_name) => ({permission_name})),
                    },
                },
                select: {name: true},
            })) as Role
        }

        revalidatePath("/roles")
        const action = name_before ? "updated" : "created"
        return {success: true, data: role, message: `Role ${action} successfully`}
    } catch (error) {
        return handleServerError(error)
    }
}
