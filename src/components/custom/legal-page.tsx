import Link from "next/link"
import type {ReactNode} from "react"
import {PiArrowLeft} from "react-icons/pi"

export const CONTACT_EMAIL = "help.seevee@svtyv.com"

// shortcut: hardcoded list, keep it in sync with the methods enabled in the Midtrans dashboard.
export const PAYMENT_METHODS = ["QRIS", "GoPay", "ShopeePay", "Bank transfer (VA)", "Credit / debit card"]

export const LEGAL_LINKS = [
    {href: "/terms", label: "Terms"},
    {href: "/privacy", label: "Privacy"},
]

export function Mail() {
    return (
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-foreground underline underline-offset-4">
            {CONTACT_EMAIL}
        </a>
    )
}

/** Shared shell for /terms and /privacy. Children are <section>s with an h2 and p/ul. */
export default function LegalPage({title, updated, children}: {title: string; updated: string; children: ReactNode}) {
    return (
        <main className="flex min-h-screen flex-col bg-background">
            <header className="border-b">
                <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
                    <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                        <span aria-hidden className="h-3 w-3 rotate-45 rounded-xs bg-linear-to-br from-brand to-brand-2" />
                        seevee
                    </Link>
                    <Link href="/" className="flex items-center gap-1.5 text-lg text-muted-foreground hover:text-foreground">
                        <PiArrowLeft aria-hidden /> Back
                    </Link>
                </div>
            </header>

            <article className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 text-lg leading-relaxed text-muted-foreground [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_section]:mt-10 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
                <h1 className="text-[2.75rem] leading-tight font-semibold tracking-tight text-foreground">{title}</h1>
                <p className="mt-2">Last updated: {updated}</p>
                {children}
            </article>

            <footer className="border-t">
                <nav aria-label="Legal" className="mx-auto flex w-full max-w-3xl flex-wrap gap-6 px-6 py-8 text-lg text-muted-foreground">
                    {LEGAL_LINKS.map((l) => (
                        <Link key={l.href} href={l.href} className="hover:text-foreground">
                            {l.label}
                        </Link>
                    ))}
                </nav>
            </footer>
        </main>
    )
}
