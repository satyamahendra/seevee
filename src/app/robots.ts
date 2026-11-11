import type {MetadataRoute} from "next"
import {connection} from "next/server"
import {siteUrl} from "@/utils/helpers/site-url"

export default async function robots(): Promise<MetadataRoute.Robots> {
    await connection()
    // Signed-in pages are excluded with a noindex tag in (protected)/layout.tsx; only the API is blocked here.
    return {rules: {userAgent: "*", allow: "/", disallow: "/api/"}, sitemap: `${siteUrl()}/sitemap.xml`}
}
