// Public origin of the app. BETTER_AUTH_URL is runtime-only (not a Docker build arg), so callers must render per request.
export const siteUrl = () => (process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "")
