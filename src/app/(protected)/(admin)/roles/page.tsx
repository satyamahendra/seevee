import PageHeader from "@/components/custom/page-header/page-header"
import {Suspense} from "react"
import {PiCardholder} from "react-icons/pi"
import {RolesTable} from "./components/roles-table"
import {Loader2} from "lucide-react"
import {hasPermissions} from "@/utils/helpers/has-ability-server"
import {redirect} from "next/navigation"
import AnimDiv from "@/components/custom/anim-div"
import SearchParams from "@/components/custom/search-params"
import RoleDetailModal from "./components/role-detail-modal"

type PageProps = {
    searchParams: Promise<{
        page?: string
        search?: string
    }>
}

const Page = async ({searchParams}: PageProps) => {
    const hasPerm = await hasPermissions(["read roles", "manage roles"])
    if (!hasPerm) return redirect("/home")

    const {page, search} = await searchParams
    const pageNum = page ? parseInt(page) : 1

    return (
        <AnimDiv className="flex flex-col gap-4 pb-4">
            <PageHeader
                title="Roles"
                description="Manage roles"
                icon={<PiCardholder />}
                subComponent={
                    <div className="flex justify-end">
                        <RoleDetailModal />
                    </div>
                }
            />
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
                <RolesTable page={pageNum} search={search} />
            </Suspense>
        </AnimDiv>
    )
}

export default Page
