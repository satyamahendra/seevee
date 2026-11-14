import {getUsersCached} from "../services/get-users-cached"
import {PiUser} from "react-icons/pi"
import {Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia} from "@/components/ui/empty"
import UserItem from "./user-item"
import AnimDiv from "@/components/custom/anim-div"
import {ScrollArea} from "@/components/ui/scroll-area"

type Props = {
    page?: number
    search?: string
}

export async function UsersTable({page, search}: Props) {
    const data = await getUsersCached(page, search)

    return (
        <AnimDiv className="flex min-h-0 flex-1 flex-col gap-4">
            {data.users.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border py-12">
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <PiUser />
                            </EmptyMedia>
                            <EmptyTitle>No users found</EmptyTitle>
                            <EmptyDescription>There are currently no users available.</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </div>
            ) : (
                // radix wraps content in a display:table div that ignores min-w-0, so force block to keep long emails truncating
                <ScrollArea className="min-h-0 flex-1 [&_[data-radix-scroll-area-viewport]>div]:!block">
                    {data.users.map((user) => (
                        <UserItem key={user.id} user={user} />
                    ))}
                </ScrollArea>
            )}
        </AnimDiv>
    )
}
