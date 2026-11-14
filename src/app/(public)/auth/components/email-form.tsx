"use client"

import {useRouter} from "next/navigation"
import {Controller, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Loader2} from "lucide-react"
import {toast} from "sonner"
import {authClient} from "@/lib/auth-client"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field"
import {signInSchema, type SignInFormSchema} from "../utils/schema"

const FIELDS = [
    {name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "you@example.com"},
    {name: "password", label: "Password", type: "password", autoComplete: "current-password", placeholder: "At least 8 characters"},
] as const

const EmailForm = () => {
    const router = useRouter()
    const form = useForm<SignInFormSchema>({resolver: zodResolver(signInSchema), defaultValues: {email: "", password: ""}})

    const onSubmit = async ({email, password}: SignInFormSchema) => {
        const {error} = await authClient.signIn.email({email, password})
        if (error) return toast.error(error.message ?? "Something went wrong. Try again.")
        toast.success("Signed in")
        router.push("/resume")
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup className="gap-4">
                {FIELDS.map((f) => (
                    <Controller
                        key={f.name}
                        name={f.name}
                        control={form.control}
                        render={({field, fieldState}) => (
                            <Field data-invalid={fieldState.invalid} className="gap-1.5">
                                <FieldLabel htmlFor={f.name}>{f.label}</FieldLabel>
                                <Input {...field} id={f.name} type={f.type} autoComplete={f.autoComplete} placeholder={f.placeholder} aria-invalid={fieldState.invalid} className="h-10 bg-background" />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                ))}
                <Button type="submit" size="lg" className="mt-2 h-10 w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
                    Sign in
                </Button>
            </FieldGroup>
        </form>
    )
}

export default EmailForm
