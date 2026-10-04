import type {NextConfig} from "next"

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    output: "standalone",
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {key: "X-Frame-Options", value: "DENY"},
                    {key: "X-Content-Type-Options", value: "nosniff"},
                    {key: "Referrer-Policy", value: "strict-origin-when-cross-origin"},
                    {key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()"},
                    {key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"},
                ],
            },
        ]
    },
}

export default nextConfig
