import {betterAuth} from "better-auth"
import {prismaAdapter} from "better-auth/adapters/prisma"
import prisma from "./prisma/client"
import {customSession} from "better-auth/plugins"
import {getSessionExtended} from "@/utils/services/get-session-extended"

export const auth = betterAuth({
    experimental: {joins: true},
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    baseURL: process.env.BETTER_AUTH_URL,
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    let role_name = "member"

                    if (process.env.WHITELISTED_EMAILS?.split(",").includes(user.email)) {
                        role_name = "admin"
                    }

                    await prisma.userRole.createMany({
                        data: [{user_id: user.id, role_name: role_name}],
                    })
                },
            },
        },
    },
    plugins: [
        customSession(async ({user, session}) => {
            const sessionExtended = await getSessionExtended(user.id)
            return {
                user: {
                    ...user,
                    roles: sessionExtended?.roles,
                    permissions: sessionExtended?.permissions,
                    totalCredits: sessionExtended?.totalCredits,
                },
                session,
            }
        }),
    ],
})
