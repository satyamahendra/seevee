import Sidebar from "@/components/custom/sidebar/sidebar"
import Topbar from "@/components/custom/topbar/topbar"
import {authServer} from "@/lib/auth-server"
import {redirect} from "next/navigation"
import type {Metadata} from "next"

// Private app pages: keep them out of search results.
export const metadata: Metadata = {robots: {index: false, follow: false}}

type LayoutProps = {
    children: React.ReactNode
}

const Layout = async ({children}: LayoutProps) => {
    const session = await authServer()

    if (!session) {
        return redirect(`/auth`)
    }

    return (
        <div className="flex h-dvh">
            <div className="flex flex-col items-center w-full dark:bg-background h-full">
                <Topbar />
                <Sidebar />
                <div className="max-w-250 flex w-full flex-1 min-h-0">
                    <div className="flex-1 p-6 w-full">{children}</div>
                </div>
            </div>
        </div>
    )
}

export default Layout
