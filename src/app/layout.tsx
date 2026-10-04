import {cn} from "@/lib/utils"
import type {Metadata} from "next"
import {Geist, Geist_Mono, Inter} from "next/font/google"
import "@/app/globals.css"
import {Providers} from "@/components/custom/providers/providers"
import Script from "next/script"

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "Seevee",
    description: "AI-assisted resume builder",
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
