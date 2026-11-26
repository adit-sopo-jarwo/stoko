import type { Metadata } from "next";

export const siteName = "Stoko";
export const siteDescription =
    "Pantau pergerakan saham Indonesia dan global, lalu ikuti berita pasar terbaru di Stoko.";

export function getSiteUrl(): URL | undefined {
    const value = process.env.SITE_URL?.trim();
    if (!value) return undefined;

    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error("SITE_URL harus menggunakan http atau https.");
    }
    return url;
}

export function pageMetadata({
    title,
    description,
    path,
    index = true,
}: {
    title: string;
    description: string;
    path: string;
    index?: boolean;
}): Metadata {
    const siteUrl = getSiteUrl();
    const canonical = siteUrl ? new URL(path, siteUrl).toString() : undefined;
    const fullTitle = `${title} | ${siteName}`;

    return {
        title,
        description,
        alternates: canonical ? { canonical } : undefined,
        openGraph: {
            title: fullTitle,
            description,
            url: canonical,
            siteName,
            locale: "id_ID",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description,
        },
        robots: index ? undefined : { index: false, follow: true },
    };
}
