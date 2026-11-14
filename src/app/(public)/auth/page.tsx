import Link from "next/link"
import {PiCaretLeft} from "react-icons/pi"
import GoogleItem from "./components/google-item"
import EmailForm from "./components/email-form"
import type {Metadata} from "next"

export const metadata: Metadata = {title: "Sign in", alternates: {canonical: "/auth"}, robots: {index: false, follow: true}}

const Page = () => {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-desk px-4 py-12 text-ink">
            <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border bg-paper p-8 shadow-sm">
                <header className="flex flex-col gap-3">
                    <Link href="/" className="flex w-fit items-center gap-2 text-xl font-semibold tracking-tight">
                        <span aria-hidden className="h-3 w-3 rotate-45 rounded-xs bg-linear-to-br from-brand to-brand-2" />
                        seevee
                    </Link>
                    <p className="text-lg text-muted-foreground">Sign in to keep building your resume.</p>
                </header>

                <GoogleItem />

                <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    or
                    <span className="h-px flex-1 bg-border" />
                </div>

                <EmailForm />
            </div>

            <Link href="/" className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
                <PiCaretLeft /> Back to home
            </Link>
        </main>
    )
}

export default Page
