import {authServer} from "@/lib/auth-server"
import {getActiveProducts} from "@/utils/services/get-active-products"
import {Button} from "@/components/ui/button"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"
import CheckoutButton from "@/components/custom/landing/checkout-button"
import {formatIdr, formatUsd, usdCentsToIdr, usdToIdrRate} from "@/utils/helpers/format-usd"
import {cn} from "@/lib/utils"
import {PiArrowRight, PiCheck, PiDotsSixVertical, PiFilePdf, PiLinkSimple, PiMagicWand, PiShieldCheck, PiTranslate} from "react-icons/pi"
import {CONTACT_EMAIL, LEGAL_LINKS, PAYMENT_METHODS} from "@/components/custom/legal-page"
import {Familjen_Grotesk, Spectral} from "next/font/google"
import Link from "next/link"
import {siteUrl} from "@/utils/helpers/site-url"
import type {ComponentType, ReactNode} from "react"

// Overrides --font-sans inside the landing page only, so shadcn buttons pick it up too.
const grotesk = Familjen_Grotesk({subsets: ["latin"], variable: "--font-sans"})
const spectral = Spectral({subsets: ["latin"], weight: ["400"], style: ["italic"], variable: "--font-paper"})

const features: {icon: ComponentType<{className?: string}>; title: string; body: string}[] = [
    {icon: PiMagicWand, title: "Tailored to each job", body: "Paste a job description. Every section is rewritten for it, without inventing facts."},
    {icon: PiTranslate, title: "Any language", body: "Translate the whole resume in one pass."},
    {icon: PiDotsSixVertical, title: "Your layout", body: "Reorder sections and pick a font."},
    {icon: PiLinkSimple, title: "One link to share", body: "Recruiters open it without signing in."},
    {icon: PiFilePdf, title: "Print to PDF", body: "Clean, single-column, ready to send."},
]

const steps = [
    {title: "Write your resume once", body: "Fill in your experience, skills and summary. It's your master copy."},
    {title: "Paste a job description", body: "Drop in the posting you're applying for, or give the AI your own instruction."},
    {title: "Send the tailored version", body: "Share a link or print to PDF. Your master copy stays untouched for the next job."},
]

const FREE = ["Write and edit resumes", "Reorder sections, pick a font", "Public share link", "Print to PDF"]
const PAID = ["Tailor to a job description", "Translate to another language", "Rewrite with your own instruction"]

const faqs: {q: string; a: string}[] = [
    {q: "What is a credit?", a: "One credit pays for one AI rewrite: tailoring to a job, translating, or following your own instruction. Everything else is free."},
    {
        q: "Will the AI make up experience I don't have?",
        a: "No. It rewrites and reorders what you wrote so it matches the job. It doesn't add jobs, skills or numbers you didn't give it.",
    },
    {q: "Do recruiters need an account to see my resume?", a: "No. Your share link opens for anyone, no sign-in needed."},
    {q: "How do I sign in?", a: "With your Google account. There is no separate password to remember."},
    {
        q: "What currency am I charged in?",
        a: "Prices are shown in USD and charged in Indonesian Rupiah (IDR) through Midtrans, at the rate shown under Pricing. Each pack lists its exact IDR amount. If your card isn't in IDR, your bank converts the charge, so your statement may differ slightly.",
    },
    {q: "Can I get a refund?", a: "All purchases are final and credits are non-refundable, so start with a small pack if you want to try it first."},
]

export default async function LandingPage() {
    const session = await authServer()
    const startHref = session ? "/resume" : "/auth"
    const startLabel = session ? "Open my resumes" : "Start for free"

    const productsRes = await getActiveProducts()
    const products = productsRes.success ? productsRes.data : []
    const perCredit = (p: (typeof products)[number]) => (p.credit > 0 ? p.price_actual / p.credit : Infinity)
    // Highlight the cheapest-per-credit pack, only when there is something to compare against.
    const bestId = products.length > 1 ? products.reduce((a, b) => (perCredit(b) < perCredit(a) ? b : a)).id : null
    const rate = usdToIdrRate()

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "seevee",
            url: siteUrl(),
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description: "AI-assisted resume builder: tailor your resume to each job, translate it, share it with one link, or print it to PDF.",
            offers: {"@type": "Offer", price: "0", priceCurrency: "USD"},
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({"@type": "Question", name: f.q, acceptedAnswer: {"@type": "Answer", text: f.a}})),
        },
    ]

    return (
        <main className={cn("flex flex-1 flex-col font-sans text-ink", grotesk.variable, spectral.variable)}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")}} />
            <div className="bg-desk">
                {/* 1fr | auto | 1fr keeps the links centered on the page, whatever the logo and button widths. */}
                <header className="mx-auto grid w-full max-w-360 grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 py-5">
                    <Link href="/" className="flex items-center gap-2 justify-self-start text-xl font-semibold tracking-tight">
                        <span aria-hidden className="h-3 w-3 rotate-45 rounded-xs bg-linear-to-br from-brand to-brand-2" />
                        seevee
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link href="#how" className="hidden text-lg text-muted-foreground hover:text-ink sm:block">
                            How it works
                        </Link>
                        <Link href="#pricing" className="hidden text-lg text-muted-foreground hover:text-ink sm:block">
                            Pricing
                        </Link>
                        <Link href="#faq" className="hidden text-lg text-muted-foreground hover:text-ink sm:block">
                            FAQ
                        </Link>
                    </nav>
                    <Button asChild size="lg" variant="outline" className="justify-self-end text-base">
                        <Link href={startHref}>{session ? "My resumes" : "Sign in"}</Link>
                    </Button>
                </header>

                <section className="mx-auto flex w-full max-w-360 flex-col items-center px-6 pt-14 pb-20 text-center lg:pt-20">
                    <span className="mb-6 inline-flex items-center gap-2 rounded-full border bg-paper px-3 py-1 text-base text-muted-foreground">
                        <span aria-hidden className="size-2 rounded-full bg-linear-to-r from-brand to-brand-2" />
                        AI resume tailoring
                    </span>
                    <h1 className="max-w-4xl text-[3.75rem] leading-[0.98] font-semibold tracking-[-0.035em] text-balance sm:text-[6rem]">
                        Your resume, rewritten for{" "}
                        <span className="bg-linear-to-r from-brand to-brand-2 bg-clip-text pr-1 font-paper font-normal text-transparent italic">every</span> job.
                    </h1>
                    <p className="mt-6 max-w-lg text-xl leading-relaxed text-pretty text-muted-foreground">
                        Paste a job description. Get a tailored resume and a link to share, in seconds.
                    </p>
                    <Button asChild size="lg" className="mt-9 h-12 bg-ink px-6 text-lg text-paper hover:bg-ink/85">
                        <Link href={startHref}>
                            {startLabel} <PiArrowRight aria-hidden />
                        </Link>
                    </Button>
                    <p className="mt-4 text-base text-muted-foreground">Free to write and share. Pay only for AI rewrites.</p>

                    <video
                        src="/seevee%20edited.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        aria-label="seevee tailoring a resume with AI"
                        // shortcut: crops the 24px black bars baked into the 1080x1080 file; drop aspect/object-cover after re-exporting without them.
                        className="mt-16 aspect-[1080/1032] w-full max-w-6xl rounded-xl object-cover"
                    />
                </section>
            </div>

            <section id="how" className="mx-auto w-full max-w-360 scroll-mt-6 px-6 py-24">
                <SectionTitle eyebrow="How it works" title="Three steps, one resume per job" />
                <ol className="mx-auto mt-12 grid max-w-6xl gap-8 sm:grid-cols-3">
                    {steps.map((step, i) => (
                        <li key={step.title} className="border-t pt-6">
                            <span className="font-paper text-4xl text-brand italic">0{i + 1}</span>
                            <h3 className="mt-3 text-xl font-semibold tracking-tight">{step.title}</h3>
                            <p className="mt-1 text-lg leading-relaxed text-muted-foreground">{step.body}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="border-t bg-desk">
                <div className="mx-auto w-full max-w-360 px-6 py-24">
                    <SectionTitle eyebrow="Example" title="Same facts, aimed at the job" />
                    <p className="mx-auto mt-3 max-w-xl text-center text-lg text-muted-foreground">
                        Job ad: <span className="text-ink">&ldquo;Looking for a React developer who cares about performance and code quality.&rdquo;</span>
                    </p>
                    <div className="mx-auto mt-12 grid max-w-5xl items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                        <ExampleCard label="Before">
                            Worked on the company website. Fixed bugs and helped make pages load faster. Used React and wrote some tests.
                        </ExampleCard>
                        <PiArrowRight aria-hidden className="mx-auto rotate-90 text-2xl text-muted-foreground md:rotate-0" />
                        <ExampleCard label="After" accent>
                            Built and maintained the company website in <Hl>React</Hl>, focused on <Hl>page performance</Hl> and fixing bugs, backed by tests for{" "}
                            <Hl>code quality</Hl>.
                        </ExampleCard>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-360 px-6 py-24">
                <SectionTitle eyebrow="Features" title="What you get" />
                <ul className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {features.map(({icon: Icon, title, body}) => (
                        <li key={title} className="rounded-xl border bg-paper p-6">
                            <Icon aria-hidden className="text-3xl text-brand" />
                            <h3 className="mt-3 text-xl font-semibold tracking-tight">{title}</h3>
                            <p className="mt-1 text-lg leading-relaxed text-muted-foreground">{body}</p>
                        </li>
                    ))}
                </ul>

                <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2">
                    <PlanList title="Free, forever" items={FREE} />
                    <PlanList title="With credits" items={PAID} accent />
                </div>
            </section>

            <section id="pricing" className="scroll-mt-6 border-t bg-desk">
                <div className="mx-auto w-full max-w-360 px-6 py-24">
                    <SectionTitle eyebrow="Pricing" title="Pay per rewrite" />
                    <p className="mt-3 text-center text-lg text-muted-foreground">1 credit = 1 AI rewrite. No subscription.</p>

                    {products.length === 0 ? (
                        <p className="mt-12 text-center text-lg text-muted-foreground">Credit packs are not on sale yet. Check back soon.</p>
                    ) : (
                        <ul className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {products.map((product) => {
                                const best = product.id === bestId
                                return (
                                    <li key={product.id} className={cn("relative flex flex-col rounded-xl border bg-paper p-8", best && "border-brand")}>
                                        {best && (
                                            <span className="absolute -top-3 left-8 rounded-full bg-linear-to-r from-brand to-brand-2 px-3 py-1 text-sm font-medium text-white">
                                                Best value
                                            </span>
                                        )}
                                        <h3 className="text-xl font-semibold tracking-tight">{product.name}</h3>
                                        <div className="mt-4 flex items-baseline gap-2">
                                            <span className="text-[2.75rem] leading-none font-semibold tracking-tight tabular-nums">
                                                {formatUsd(product.price_actual)}
                                            </span>
                                            {product.price_alternate > product.price_actual && (
                                                <span className="text-lg text-muted-foreground line-through">{formatUsd(product.price_alternate)}</span>
                                            )}
                                        </div>
                                        {rate && (
                                            <p className="mt-2 text-base text-muted-foreground tabular-nums">
                                                Charged as {formatIdr(usdCentsToIdr(product.price_actual))}
                                            </p>
                                        )}
                                        <ul className="mt-6 mb-8 space-y-2 text-lg">
                                            <li className="flex items-center gap-2">
                                                <PiCheck aria-hidden />
                                                {product.credit} AI rewrites
                                            </li>
                                            {product.credit > 0 && (
                                                <li className="flex items-center gap-2 text-muted-foreground">
                                                    <PiCheck aria-hidden />
                                                    {formatUsd(Math.round(perCredit(product)))} each
                                                </li>
                                            )}
                                            {product.type === "bundle" &&
                                                product.bundle_items.map((item) => (
                                                    <li key={item.product.name} className="flex items-center gap-2 text-muted-foreground">
                                                        <PiCheck aria-hidden />
                                                        Includes {item.product.name}
                                                    </li>
                                                ))}
                                        </ul>
                                        <div className="mt-auto">
                                            <CheckoutButton productId={product.id} />
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}

                    <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center gap-4 text-center">
                        <p className="flex items-center gap-2 text-lg">
                            <PiShieldCheck aria-hidden className="text-xl" />
                            Secure checkout by Midtrans. We never see or store your card details.
                        </p>
                        <ul aria-label="Payment methods" className="flex flex-wrap justify-center gap-2">
                            {PAYMENT_METHODS.map((m) => (
                                <li key={m} className="rounded-md border bg-paper px-3 py-1.5 text-base text-muted-foreground">
                                    {m}
                                </li>
                            ))}
                        </ul>
                        <p className="text-base text-muted-foreground">
                            Prices in USD, charged in IDR{rate && <> at 1 USD = {formatIdr(rate)}</>}. If your card isn&apos;t in IDR, your bank converts it. Credits are
                            added right after payment. All purchases are final.{" "}
                            <Link href="/terms#payment" className="underline underline-offset-4 hover:text-ink">
                                Payment terms
                            </Link>
                        </p>
                    </div>
                </div>
            </section>

            <section id="faq" className="mx-auto w-full max-w-360 scroll-mt-6 px-6 py-24">
                <SectionTitle eyebrow="FAQ" title="Questions, answered" />
                <Accordion type="single" collapsible className="mx-auto mt-12 max-w-3xl">
                    {faqs.map((f) => (
                        <AccordionItem key={f.q} value={f.q}>
                            <AccordionTrigger className="text-lg">{f.q}</AccordionTrigger>
                            <AccordionContent className="text-lg leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>

            <section className="border-t bg-desk">
                <div className="mx-auto flex w-full max-w-360 flex-col items-center px-6 py-24 text-center">
                    <h2 className="max-w-2xl text-[2.75rem] leading-tight font-semibold tracking-tight text-balance">Your next application deserves its own resume.</h2>
                    <span aria-hidden className="mt-6 h-1 w-16 rounded-full bg-linear-to-r from-brand to-brand-2" />
                    <Button asChild size="lg" className="mt-8 h-12 bg-ink px-6 text-lg text-paper hover:bg-ink/85">
                        <Link href={startHref}>
                            {startLabel} <PiArrowRight aria-hidden />
                        </Link>
                    </Button>
                </div>
            </section>

            <footer className="border-t">
                <div className="mx-auto flex w-full max-w-360 flex-wrap items-center justify-between gap-4 px-6 py-8 text-lg text-muted-foreground">
                    <span>
                        © {new Date().getFullYear()} seevee ·{" "}
                        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink">
                            {CONTACT_EMAIL}
                        </a>
                    </span>
                    <nav aria-label="Legal" className="flex flex-wrap gap-6">
                        {LEGAL_LINKS.map((l) => (
                            <Link key={l.href} href={l.href} className="hover:text-ink">
                                {l.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </footer>
        </main>
    )
}

function SectionTitle({eyebrow, title}: {eyebrow: string; title: string}) {
    return (
        <div className="text-center">
            <p className="text-base font-medium tracking-wide text-brand uppercase">{eyebrow}</p>
            <h2 className="mt-2 text-[2.75rem] leading-tight font-semibold tracking-tight text-balance">{title}</h2>
        </div>
    )
}

function ExampleCard({label, accent, children}: {label: string; accent?: boolean; children: ReactNode}) {
    return (
        <div className={cn("rounded-xl border bg-paper p-6 text-left", accent && "border-brand/40")}>
            <p className={cn("text-sm font-medium tracking-wide uppercase", accent ? "text-brand" : "text-muted-foreground")}>{label}</p>
            <p className="mt-3 text-lg leading-relaxed">{children}</p>
        </div>
    )
}

function Hl({children}: {children: ReactNode}) {
    return <span className="rounded-sm bg-brand/10 px-1 text-brand">{children}</span>
}

function PlanList({title, items, accent}: {title: string; items: string[]; accent?: boolean}) {
    return (
        <div className={cn("rounded-xl border p-6", accent && "border-brand/40")}>
            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
            <ul className="mt-4 space-y-2 text-lg">
                {items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                        <PiCheck aria-hidden className={accent ? "text-brand" : "text-muted-foreground"} />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}
