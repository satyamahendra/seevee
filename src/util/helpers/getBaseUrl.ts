export function getBaseUrl(): string {
    if (typeof window !== "undefined") {
        return `${window.location.protocol}//${window.location.host}`
    }
    return ""
}
