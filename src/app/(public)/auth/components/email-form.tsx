"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import {Controller, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Loader2} from "lucide-react"
import {toast} from "sonner"
import {authClient} from "@/lib/auth-client"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field"
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {signInSchema, signUpSchema, type SignUpFormSchema} from "../utils/schema"

type Mode = "sign-in" | "sign-up"

const EmailForm = () => {
    const router = useRouter()
    const [mode, setMode] = useState<Mode>("sign-in")
    const isSignUp = mode === "sign-up"

    const form = useForm<SignUpFormSchema>({
        // sign-in ignores `name`, so it validates against the smaller schema
        resolver: zodResolver(isSignUp ? signUpSchema : (signInSchema as typeof signUpSchema)),
        defaultValues: {name: "", email: "", password: ""},
    })

    const onSubmit = async ({name, email, password}: SignUpFormSchema) => {
        const {error} = isSignUp
            ? await authClient.signUp.email({name, email, password})
            : await authClient.signIn.email({email, password})
        if (error) return toast.error(error.message ?? "Something went wrong. Try again.")
        toast.success(isSignUp ? "Account created" : "Signed in")
        router.push("/resume")
    }

    const fields = [
        ...(isSignUp ? [{name: "name", label: "Name", type: "text", autoComplete: "name"} as const] : []),
        {name: "email", label: "Email", type: "email", autoComplete: "email"},
        {name: "password", label: "Password", type: "password", autoComplete: isSignUp ? "new-password" : "current-password"},
    ] as const

    return (
        <div className="flex flex-col gap-6">
            <Tabs
                value={mode}
                onValueChange={(value) => {
                    setMode(value as Mode)
                    form.clearErrors()
                }}>
                <TabsList className="w-full">
                    <TabsTrigger value="sign-in">Sign in</TabsTrigger>
                    <TabsTrigger value="sign-up">Create account</TabsTrigger>
                </TabsList>
            </Tabs>

            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <FieldGroup className="gap-4">
                    {fields.map((f) => (
                        <Controller
                            key={f.name}
                            name={f.name}
                            control={form.control}
                            render={({field, fieldState}) => (
                                <Field data-invalid={fieldState.invalid} className="gap-1.5">
                                    <FieldLabel htmlFor={f.name}>{f.label}</FieldLabel>
                                    <Input {...field} id={f.name} type={f.type} autoComplete={f.autoComplete} aria-invalid={fieldState.invalid} className="h-10" />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    ))}
                    <Button type="submit" size="lg" className="mt-2 h-10 w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
                        {isSignUp ? "Create account" : "Sign in"}
                    </Button>
                </FieldGroup>
            </form>
        </div>
    )
}

export default EmailForm
