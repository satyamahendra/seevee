import PageHeader from "@/components/custom/page-header/page-header"
import {PiKey} from "react-icons/pi"
import {hasPermissions} from "@/utils/helpers/has-ability-server"
import {redirect} from "next/navigation"
import AnimDiv from "@/components/custom/anim-div"
import CreateAttributeModal from "./components/create-attribute-modal"
import PermissionDetailModal from "./components/permission-detail-modal"
import PermissionList from "./components/permission-list"

const Page = async () => {
    const hasPerm = await hasPermissions(["read permissions", "manage permissions"])
    if (!hasPerm) return redirect("/home")

    return (
        <AnimDiv className="flex flex-col gap-4 pb-4">
            <PageHeader
                title="Permissions"
                description="Manage permission attributes and role connections"
                icon={<PiKey />}
                subComponent={
                    <div className="flex justify-end">
                        <CreateAttributeModal />
                    </div>
                }
            />
            <PermissionDetailModal />
            <PermissionList />
        </AnimDiv>
    )
}

export default Page
