import PageHeader from "@/components/custom/page-header/page-header"
import {Suspense} from "react"
import {PiUser} from "react-icons/pi"
import {UsersTable} from "./components/users-table"
import {UsersPagination} from "./components/users-pagination"
import {Loader2} from "lucide-react"
import {hasPermissions} from "@/utils/helpers/has-ability-server"
import {redirect} from "next/navigation"
import AnimDiv from "@/components/custom/anim-div"
import SearchParams from "@/components/custom/search-params"
import UserDetailModal from "./components/user-detail-modal"

type PageProps = {
    searchParams: Promise<{
        page?: string
        search?: string
    }>
}

const Page = async ({searchParams}: PageProps) => {
    const hasPerm = await hasPermissions(["read users", "manage users"])
    if (!hasPerm) return redirect("/resume")

    const {page, search} = await searchParams
    const pageNum = page ? parseInt(page) : 1

    return (
        <AnimDiv className="flex h-full min-h-0 flex-col gap-4">
            <PageHeader title="Users" description="Manage users" icon={<PiUser />} />
            <UserDetailModal />
            <SearchParams className="w-48 self-end" />
            <Suspense
                key={`${pageNum}-${search}`}
                fallback={
                    <AnimDiv className="flex min-h-0 flex-1 items-center justify-center">
                        <Loader2 className="animate-spin text-primary" />
                    </AnimDiv>
                }>
                <UsersTable page={pageNum} search={search} />
            </Suspense>
            {/* no key: React keeps the old pagination on screen while the next page loads instead of swapping in the fallback */}
            <Suspense fallback={null}>
                <UsersPagination page={pageNum} search={search} />
            </Suspense>
        </AnimDiv>
    )
}

export default Page
