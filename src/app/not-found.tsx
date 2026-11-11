import Link from "next/link"
import {Button} from "@/components/ui/button"

export default function NotFound() {
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
            <p className="text-base font-medium text-muted-foreground">404</p>
            <h1 className="text-[2.75rem] leading-tight font-semibold tracking-tight">Page not found</h1>
            <p className="max-w-sm text-lg text-muted-foreground">This page doesn&apos;t exist, or the resume isn&apos;t public.</p>
            <Button asChild size="lg" className="mt-2">
                <Link href="/">Back to home</Link>
            </Button>
        </main>
    )
}
