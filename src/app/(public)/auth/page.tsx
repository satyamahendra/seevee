import {Button} from "@/components/ui/button"
import Link from "next/link"
import {PiCaretLeft} from "react-icons/pi"
import GoogleItem from "./components/google-item"

const Page = () => {
    return (
        <main className="flex min-h-screen items-center justify-center">
            <div className="w-[300px] flex flex-col gap-4">
                <div className="font-bold">Seevee</div>
                <div>Sign in to your account</div>
                <GoogleItem />
                <Link href="/" className="flex items-center gap-2 hover:cursor-pointer">
                    <Button variant="link">
                        <PiCaretLeft /> home
                    </Button>
                </Link>
            </div>
        </main>
    )
}

export default Page
