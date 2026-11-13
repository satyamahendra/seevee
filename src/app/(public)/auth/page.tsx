import Link from "next/link"
import {PiCaretLeft} from "react-icons/pi"
import GoogleItem from "./components/google-item"
import EmailForm from "./components/email-form"
import type {Metadata} from "next"

export const metadata: Metadata = {title: "Sign in", alternates: {canonical: "/auth"}, robots: {index: false, follow: true}}

const Page = () => {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <div className="flex w-full max-w-85 flex-col gap-8">
                <Link href="/" className="flex w-fit items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
                    <PiCaretLeft /> Home
                </Link>

                <header className="flex flex-col gap-2">
                    <h1 className="text-4xl font-semibold tracking-tight">Seevee</h1>
                    <p className="text-muted-foreground">Sign in or create an account to keep building your resume.</p>
                </header>

                <EmailForm />

                <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    or
                    <span className="h-px flex-1 bg-border" />
                </div>

                <GoogleItem />
            </div>
        </main>
    )
}

export default Page
