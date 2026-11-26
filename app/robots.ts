import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
    const siteUrl = getSiteUrl();

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/api/", "/search"],
        },
        sitemap: siteUrl ? new URL("/sitemap.xml", siteUrl).toString() : undefined,
    };
}
