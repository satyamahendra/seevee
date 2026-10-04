import {authServer} from "@/lib/auth-server"
import prisma from "@/lib/prisma/client"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"
import CheckoutButton from "@/components/custom/landing/checkout-button"
import {formatNumberWithCommas} from "@/util/helpers/formatNumberWithCommas"
import {PiCoins, PiCube, PiFileText, PiMagicWand, PiShareNetwork, PiSparkle} from "react-icons/pi"
import Link from "next/link"

const faqs = [
    {
        q: "How do credits work?",
        a: "Every AI assist generation spends one credit. Buy a pack, and the credits are added to your account the moment the payment settles.",
    },
    {
        q: "Can I translate my resume?",
        a: "Yes. The AI assist accepts a job description to optimize for, a translation request, or any custom instruction you provide.",
    },
    {
        q: "Can I share my resume?",
        a: "Each resume can be toggled public, giving you a short shareable link anyone can open without signing in.",
    },
    {
        q: "What happens if I run out of credits?",
        a: "You simply buy another pack from the pricing section. Your resumes and data are never affected.",
    },
]

export default async function LandingPage() {
    const session = await authServer()

    const products = await prisma.product.findMany({
        where: {is_active: true},
        orderBy: {created_at: "asc"},
        select: {
            id: true,
            name: true,
            price_actual: true,
            price_alternate: true,
            credit: true,
            type: true,
            bundle_items: {select: {product: {select: {name: true}}}},
        },
    })

    return (
        <main className="flex flex-1 flex-col">
            <header className="w-full border-b flex justify-center">
                <div className="max-w-260 w-full flex items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-2 text-lg tracking-tighter font-light">
                        <div className="aspect-square w-3 h-3 rotate-45 rounded-xs bg-primary"></div>
                        seevee
                    </Link>
                    <nav className="flex gap-6 text-sm text-muted-foreground">
                        <a href="#features" className="hover:text-foreground transition-colors">
                            Features
                        </a>
                        <a href="#pricing" className="hover:text-foreground transition-colors">
                            Pricing
                        </a>
                        <a href="#faq" className="hover:text-foreground transition-colors">
                            FAQ
                        </a>
                    </nav>
                    <Link href={session ? "/resume" : "/auth"}>
                        <Button size="sm" variant="outline">
                            {session ? "Dashboard" : "Sign in"}
                        </Button>
                    </Link>
                </div>
            </header>

            <section className="flex flex-col items-center text-center px-6 py-24 gap-6">
                <Badge variant="secondary" className="rounded-full gap-1">
                    <PiSparkle /> AI-assisted resume builder
                </Badge>
                <h1 className="max-w-3xl text-5xl sm:text-6xl tracking-tighter font-light leading-[1.05]">
                    Build a resume that gets <span className="text-primary">seen</span>.
                </h1>
                <p className="max-w-xl text-muted-foreground">
                    Design, optimize, and share a standout resume in minutes. Use AI to tailor it to any job description, then share one clean link.
                </p>
                <div className="flex gap-3">
                    <Link href="/auth">
                        <Button size="lg">Start building</Button>
                    </Link>
                    <a href="#pricing">
                        <Button size="lg" variant="outline">
                            View pricing
                        </Button>
                    </a>
                </div>
            </section>

            <section id="features" className="max-w-260 w-full mx-auto px-6 pb-20">
                <div className="grid sm:grid-cols-3 gap-4">
                    <div className="border rounded-xl p-6 space-y-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted text-xl">
                            <PiMagicWand />
                        </div>
                        <h3 className="font-medium">AI Assist</h3>
                        <p className="text-sm text-muted-foreground">
                            Optimize for a job description, translate, or rewrite — the AI keeps your structure intact and fills every section.
                        </p>
                    </div>
                    <div className="border rounded-xl p-6 space-y-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted text-xl">
                            <PiFileText />
                        </div>
                        <h3 className="font-medium">Flexible blocks</h3>
                        <p className="text-sm text-muted-foreground">
                            Compose from header, summary, skills, and general sections — reorder anything and pick your font.
                        </p>
                    </div>
                    <div className="border rounded-xl p-6 space-y-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted text-xl">
                            <PiShareNetwork />
                        </div>
                        <h3 className="font-medium">One link to share</h3>
                        <p className="text-sm text-muted-foreground">
                            Flip a resume public and get a short link anyone can open — no sign-in required to view.
                        </p>
                    </div>
                </div>
            </section>

            <section id="pricing" className="border-t flex justify-center py-20">
                <div className="max-w-260 w-full px-6 flex flex-col items-center gap-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl tracking-tighter font-light">Pricing</h2>
                        <p className="text-muted-foreground text-sm">Credit packs — one credit per AI assist generation.</p>
                    </div>
                    <div className="grid sm:grid-cols-3 md:grid-cols-4 w-full gap-4">
                        {products.map((product) => (
                            <div key={product.id} className="border rounded-xl p-6 flex flex-col gap-4 bg-card">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">{product.name}</h3>
                                    {product.type === "bundle" && (
                                        <Badge variant="secondary">
                                            <PiCube /> bundle
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-light">Rp{formatNumberWithCommas(product.price_actual)}</span>
                                    {product.price_alternate > 0 && (
                                        <span className="text-sm text-muted-foreground line-through">
                                            Rp{formatNumberWithCommas(product.price_alternate)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <PiCoins /> {product.credit} credits
                                </div>
                                {product.type === "bundle" && product.bundle_items.length > 0 && (
                                    <ul className="text-xs text-muted-foreground space-y-0.5">
                                        {product.bundle_items.map((item) => (
                                            <li key={item.product.name}>· {item.product.name}</li>
                                        ))}
                                    </ul>
                                )}
                                <div className="mt-auto">
                                    <CheckoutButton productId={product.id} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="faq" className="border-t flex justify-center py-20">
                <div className="max-w-2xl w-full px-6 flex flex-col gap-8">
                    <h2 className="text-3xl tracking-tighter font-light text-center">FAQ</h2>
                    <Accordion type="single" collapsible>
                        {faqs.map((faq) => (
                            <AccordionItem key={faq.q} value={faq.q}>
                                <AccordionTrigger>{faq.q}</AccordionTrigger>
                                <AccordionContent>{faq.a}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            <footer className="border-t flex justify-center py-8">
                <div className="max-w-260 w-full px-6 flex items-center justify-between text-sm text-muted-foreground">
                    <span>© {new Date().getFullYear()} seevee</span>
                    <Link href={session ? "/resume" : "/auth"}>Get started</Link>
                </div>
            </footer>
        </main>
    )
}