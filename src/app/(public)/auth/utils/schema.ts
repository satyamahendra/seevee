import {z} from "zod"

// better-auth defaults: password 8–128 chars
export const signInSchema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters").max(128),
})

export type SignInFormSchema = z.input<typeof signInSchema>
