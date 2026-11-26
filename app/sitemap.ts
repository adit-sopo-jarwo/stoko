import type { MetadataRoute } from "next";
import { IDX_LIST_SYMBOLS } from "@/lib/stock-symbols";
import { getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = getSiteUrl();
    if (!siteUrl) return [];

    const paths = ["/", "/market", "/stocks", "/news"];
    const stockPaths = IDX_LIST_SYMBOLS.map((symbol) => `/stocks/${symbol.replace(/\.JK$/, "")}`);

    return [...paths, ...stockPaths].map((path) => ({
        url: new URL(path, siteUrl).toString(),
    }));
}
