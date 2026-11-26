import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SearchResults } from "@/components/search-results";

export default function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string | string[] }>;
}) {
    return (
        <>
            <SiteHeader />
            <Suspense
                fallback={
                    <p className="mx-auto max-w-[1440px] px-4 py-12 text-sm text-gray-500">
                        Memuat pencarian...
                    </p>
                }
            >
                <SearchContent searchParams={searchParams} />
            </Suspense>
        </>
    );
}

async function SearchContent({
    searchParams,
}: {
    searchParams: Promise<{ q?: string | string[] }>;
}) {
    const { q } = await searchParams;
    const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
    if (!query) {
        return (
            <p className="mx-auto max-w-[1440px] px-4 py-12 text-sm text-gray-600">
                Masukkan kode atau nama saham di kolom pencarian.
            </p>
        );
    }
    return <SearchResults query={query} />;
}
