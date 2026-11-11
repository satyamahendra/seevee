import type {MetadataRoute} from "next"
import {connection} from "next/server"
import {siteUrl} from "@/utils/helpers/site-url"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    await connection()
    const url = siteUrl()
    // Shared resumes are left out on purpose: listing people's resumes for crawlers is the owner's call, not ours.
    return [
        {url, changeFrequency: "weekly", priority: 1},
        {url: `${url}/terms`, changeFrequency: "yearly", priority: 0.3},
        {url: `${url}/privacy`, changeFrequency: "yearly", priority: 0.3},
    ]
}
