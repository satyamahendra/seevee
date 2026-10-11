export function checkHasPermission(permissions: string[], userPermissions: string[]) {
    if (!permissions.some((permission) => userPermissions.includes(permission))) {
        return false
    }
    return true
}
