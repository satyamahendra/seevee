import PaginationParams from "@/components/custom/pagination-params"
import {getUsersCached} from "../services/get-users-cached"

type Props = {
    page?: number
    search?: string
}

export async function UsersPagination({page, search}: Props) {
    const data = await getUsersCached(page, search)

    return (
        <div className="ml-auto shrink-0">
            <PaginationParams className="w-fit" pageCount={data.pagination.pageCount} />
        </div>
    )
}
