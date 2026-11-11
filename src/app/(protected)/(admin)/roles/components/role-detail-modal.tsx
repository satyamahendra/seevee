"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import {Controller, useForm, useWatch} from "react-hook-form"
import {PiCardholder, PiPlus} from "react-icons/pi"

import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field"
import {Checkbox} from "@/components/ui/checkbox"
import {Badge} from "@/components/ui/badge"
import {RoleFormSchema, roleSchema} from "../utils/schemas"
import {createUpdateRole} from "../services/create-update-role"
import {toast} from "sonner"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {Loader2} from "lucide-react"
import {useQueryParams} from "@/utils/hooks/useQueryParams"
import {getRole} from "../services/get-role"
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty"
import {Switch} from "@/components/ui/switch"
import {Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger} from "@/components/ui/drawer"
import {useScreenSize} from "@/utils/hooks/useScreenSize"
import {cn} from "@/lib/utils"
import {CRUD_ACTIONS, groupPermissions} from "../utils/permission-matrix"
import {getPermissionsMatrix} from "../../permissions/services/get-permissions-matrix"

const RoleDetailModal = () => {
    const queryClient = useQueryClient()
    const {getParam, setParams} = useQueryParams()
    const {isMobile} = useScreenSize()

    const view = getParam("view")
    const isCreate = view === "create"

    const {data: roleData, isLoading} = useQuery({
        queryKey: ["role", view],
        queryFn: () => getRole(view!),
        enabled: !!view && !isCreate,
    })

    const {data: matrixData} = useQuery({
        queryKey: ["permissions-matrix"],
        queryFn: getPermissionsMatrix,
    })

    const role = roleData?.data
    const rolePermissionNames = role?.permissions.map((p) => p.permission_name) ?? []

    const form = useForm<RoleFormSchema>({
        resolver: zodResolver(roleSchema),
        values: isCreate
            ? {name: "", name_before: "", permissions: [], is_active: true}
            : {
                  name: role?.name || "",
                  name_before: role?.name || "",
                  permissions: rolePermissionNames,
                  is_active: role?.is_active ?? true,
              },
    })

    const permissionNames = matrixData?.data?.permission_names ?? []
    const {matrix, other} = groupPermissions(permissionNames)

    const watchedPermissions = useWatch({control: form.control, name: "permissions"}) ?? []

    const togglePermission = (permissionName: string, checked: boolean) => {
        const current = form.getValues("permissions")
        const next = checked ? [...new Set([...current, permissionName])] : current.filter((n) => n !== permissionName)
        form.setValue("permissions", next, {shouldDirty: true})
    }

    const {mutate, isPending} = useMutation({
        mutationFn: createUpdateRole,
        onSuccess: (res) => {
            if (!res.success) return toast.error(res.message)
            toast.success(res.message)
            queryClient.invalidateQueries({queryKey: ["roles"]})
            queryClient.invalidateQueries({queryKey: ["permissions-matrix"]})
            form.reset()
            setParams({view: ""})
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const onSubmit = (data: RoleFormSchema) => {
        mutate(data)
    }

    return (
        <Drawer swipeDirection={isMobile ? "down" : "right"} open={!!view} onOpenChange={(e) => (e ? setParams({view: "create"}) : setParams({view: ""}))}>
            <DrawerTrigger
                render={
                    <Button>
                        <PiPlus /> Create Role
                    </Button>
                }></DrawerTrigger>
            <DrawerContent aria-describedby="role-form" className={cn(isMobile ? "h-[80vh]" : "")}>
                <DrawerHeader className="flex flex-col items-center justify-center">
                    <DrawerTitle className="flex items-center gap-4">{isCreate ? "Create" : "Edit"} Role</DrawerTitle>
                    <DrawerDescription className="flex items-center gap-4">{isCreate ? "Create" : "Edit"} a custom role for your organization.</DrawerDescription>
                </DrawerHeader>

                <div className="p-6 flex-1 overflow-y-auto">
                    {!isCreate && isLoading ? (
                        <div className="flex items-center justify-center h-20">
                            <Loader2 className="animate-spin text-primary" />
                        </div>
                    ) : !isCreate && (!roleData?.success || !role) ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <PiCardholder />
                                </EmptyMedia>
                                <EmptyTitle>Failed to fetch role</EmptyTitle>
                                <EmptyDescription>Failed to fetch role. Please try again.</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <form id="role-form" onSubmit={form.handleSubmit(onSubmit)} className={isPending ? "pointer-events-none opacity-50" : ""}>
                            <FieldGroup>
                                <Controller
                                    name="name"
                                    control={form.control}
                                    render={({field, fieldState}) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Role Name</FieldLabel>
                                            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="Admin" autoComplete="off" />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="is_active"
                                    control={form.control}
                                    render={({field}) => (
                                        <Field>
                                            <FieldLabel htmlFor="is_active">is active?</FieldLabel>
                                            <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
                                        </Field>
                                    )}
                                />
                            </FieldGroup>

                            <div className="mt-6">
                                <div className="mb-2 flex items-center gap-2">
                                    <h3 className="text-sm font-medium">Permissions</h3>
                                    <Badge variant="outline" className="text-muted-foreground">
                                        {watchedPermissions.length} selected
                                    </Badge>
                                </div>

                                {matrix.length === 0 && other.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No permissions available.</p>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border">
                                        <table className="w-full min-w-max text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/50">
                                                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Attribute</th>
                                                    {CRUD_ACTIONS.map((action) => (
                                                        <th key={action} className="px-3 py-2 text-center font-medium capitalize">
                                                            {action}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {matrix.map((group) => (
                                                    <tr key={group.attribute} className="border-b last:border-0">
                                                        <td className="px-3 py-2 font-medium">{group.attribute}</td>
                                                        {CRUD_ACTIONS.map((action) => {
                                                            const permissionName = `${action} ${group.attribute}`
                                                            return (
                                                                <td key={action} className="px-3 py-2 text-center">
                                                                    <Checkbox
                                                                        checked={watchedPermissions.includes(permissionName)}
                                                                        onCheckedChange={(c) => togglePermission(permissionName, !!c)}
                                                                        title={permissionName}
                                                                    />
                                                                </td>
                                                            )
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {other.length > 0 && (
                                    <div className="mt-4 flex flex-col gap-1.5">
                                        <h4 className="text-xs font-medium text-muted-foreground">Other permissions</h4>
                                        {other.map((permissionName) => (
                                            <label key={permissionName} className="flex items-center gap-2 text-sm">
                                                <Checkbox
                                                    checked={watchedPermissions.includes(permissionName)}
                                                    onCheckedChange={(c) => togglePermission(permissionName, !!c)}
                                                />
                                                {permissionName}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </form>
                    )}
                </div>

                <DrawerFooter>
                    <DrawerClose
                        render={
                            <Button variant="outline" className="w-full">
                                Cancel
                            </Button>
                        }></DrawerClose>
                    <Button disabled={isPending} type="submit" form="role-form">
                        {isPending ? <Loader2 className="animate-spin" /> : "Submit"}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default RoleDetailModal
