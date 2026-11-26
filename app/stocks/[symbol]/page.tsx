import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { StockDetail } from "@/components/stock-detail";

export default function StockPage({
    params,
    searchParams,
}: {
    params: Promise<{ symbol: string }>;
    searchParams: Promise<{ market?: string }>;
}) {
    return (
        <>
            <SiteHeader />
            <Suspense
                fallback={
                    <div className="mx-auto max-w-360 px-4 py-12 text-sm text-gray-500">
                        Memuat detail saham...
                    </div>
                }
            >
                <StockDetailContent params={params} searchParams={searchParams} />
            </Suspense>
        </>
    );
}

async function StockDetailContent({
    params,
    searchParams,
}: {
    params: Promise<{ symbol: string }>;
    searchParams: Promise<{ market?: string }>;
}) {
    const { symbol: rawSymbol } = await params;
    const { market } = await searchParams;
    const symbol = rawSymbol.toUpperCase();
    const global = market === "ALL";
    if (global ? !/^[A-Z0-9^][A-Z0-9.^=\-]{0,29}$/.test(symbol) : !/^[A-Z]{4}$/.test(symbol))
        notFound();

    return <StockDetail symbol={symbol} global={global} />;
}
