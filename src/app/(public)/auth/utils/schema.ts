import {z} from "zod"

// better-auth defaults: password 8–128 chars
export const signInSchema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters").max(128),
})

export const signUpSchema = signInSchema.extend({
    name: z.string().trim().min(1, "Enter your name").max(100),
})

export type SignUpFormSchema = z.input<typeof signUpSchema>
