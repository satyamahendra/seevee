import prisma from "@/lib/prisma/client"

export async function getSessionExtended(userId: string) {
    const user = await prisma.user.findUnique({
        where: {id: userId},
        select: {
            roles: {
                where: {
                    role: {is: {is_active: true}},
                },
                select: {
                    role_name: true,
                    role: {
                        select: {
                            permissions: {
                                where: {
                                    permission: {is: {is_active: true}},
                                },
                                select: {permission_name: true},
                            },
                        },
                    },
                },
            },
            permissions: {
                where: {
                    permission: {is: {is_active: true}},
                },
                select: {permission_name: true},
            },
            userCredits: {
                select: {totalCredits: true},
            },
        },
    })

    if (!user) return null

    const roles = user.roles.map((r) => r.role_name)

    const directPermissions = user.permissions.map((p) => p.permission_name)

    const rolePermissions = user.roles.flatMap((r) => r.role.permissions.map((p) => p.permission_name))

    const permissions = [...new Set([...directPermissions, ...rolePermissions])]

    return {roles, permissions, totalCredits: user.userCredits[0]?.totalCredits ?? 0}
}
