import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { MarketTicker } from "@/components/market-ticker";
import { MarketDashboard } from "@/components/market-dashboard";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
    title: "Pasar Saham",
    description: "Lihat ringkasan pasar, saham teraktif, penguat, dan pelemah di Stoko.",
    path: "/market",
});

export default function MarketPage() {
    return (
        <>
            <SiteHeader />
            <MarketTicker />
            <MarketDashboard />
        </>
    );
}
