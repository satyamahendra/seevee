import PageHeader from "@/components/custom/page-header/page-header"
import {Suspense} from "react"
import {PiUser} from "react-icons/pi"
import {UsersTable} from "./components/users-table"
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
        <AnimDiv className="flex flex-col gap-4 pb-4">
            <PageHeader title="Users" description="Manage users" icon={<PiUser />} />
            <UserDetailModal />
            <SearchParams className="w-48 self-end" />
            <Suspense
                key={`${pageNum}-${search}`}
                fallback={
                    <AnimDiv className="flex items-center justify-center h-20">
                        <span className="text-muted-foreground">
                            <Loader2 className="animate-spin text-primary" />
                        </span>
                    </AnimDiv>
                }>
                <UsersTable page={pageNum} search={search} />
            </Suspense>
        </AnimDiv>
    )
}

export default Page
