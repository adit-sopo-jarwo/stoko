import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { StockList } from "@/components/stock-list";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
    title: "Daftar Saham",
    description: "Jelajahi daftar saham Indonesia dan lihat harga serta pergerakannya di Stoko.",
    path: "/stocks",
});

export default function StocksPage() {
    return (
        <>
            <SiteHeader />
            <StockList />
        </>
    );
}
