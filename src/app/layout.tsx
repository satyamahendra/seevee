import {cn} from "@/lib/utils"
import type {Metadata} from "next"
import {Geist, Geist_Mono, Inter} from "next/font/google"
import "@/app/globals.css"
import {Providers} from "@/components/custom/providers/providers"
import Script from "next/script"
import {connection} from "next/server"
import {siteUrl} from "@/utils/helpers/site-url"

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

const description = "Write your resume once, then tailor it to every job with AI. Translate it, share it with one link, or print it to PDF."

export async function generateMetadata(): Promise<Metadata> {
    // The site URL is only known at runtime (see site-url.ts).
    await connection()
    return {
        metadataBase: new URL(siteUrl()),
        title: {default: "seevee | AI resume builder that tailors your resume to every job", template: "%s | seevee"},
        description,
        applicationName: "seevee",
        alternates: {canonical: "/"},
        openGraph: {type: "website", siteName: "seevee", locale: "en_US", url: "/", description},
        twitter: {card: "summary_large_image"},
    }
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}>
            <body suppressHydrationWarning className="min-h-full flex flex-col">
                <Providers>{children}</Providers>
                <Script
                    src={`${process.env.NEXT_PUBLIC_MIDTRANS_URL}/snap/snap.js`}
                    data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                    strategy="lazyOnload"
                />
            </body>
        </html>
    )
}
