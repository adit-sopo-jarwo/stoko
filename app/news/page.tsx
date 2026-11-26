import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { MarketTicker } from "@/components/market-ticker";
import { NewsSection } from "@/components/news-section";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
    title: "Berita Pasar",
    description: "Baca berita saham, emiten, dan pasar keuangan terbaru di Stoko.",
    path: "/news",
});

export default function NewsPage() {
    return (
        <>
            <SiteHeader />
            <MarketTicker />
            <NewsSection fullPage />
        </>
    );
}
