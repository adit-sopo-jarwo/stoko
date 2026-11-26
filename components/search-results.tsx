"use client";

import { useEffect, useState } from "react";
import { StockTable, type StockRow } from "@/components/stock-table";

export function SearchResults({ query }: { query: string }) {
    const [rows, setRows] = useState<StockRow[]>([]);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            try {
                const response = await fetch(
                    `/api/search?q=${encodeURIComponent(query)}&limit=30`,
                    { signal: controller.signal },
                );
                if (!response.ok) throw new Error("Search unavailable");
                const results: StockRow[] = await response.json();
                const matches = results.filter(
                    (row) =>
                        row.quoteType === "EQUITY" &&
                        /^[A-Z0-9^][A-Z0-9.^=\-]{0,29}$/.test(row.symbol),
                );
                const symbols = matches.map((row) => row.symbol);
                if (symbols.length > 0) {
                    const quotes = await fetch(
                        `/api/stocks?market=ALL&symbols=${encodeURIComponent(symbols.join(","))}`,
                        { signal: controller.signal },
                    );
                    if (quotes.ok) {
                        const quoted: StockRow[] = await quotes.json();
                        const bySymbol = new Map(quoted.map((row) => [row.symbol, row]));
                        setRows(
                            matches.map((row) => ({
                                ...row,
                                ...bySymbol.get(row.symbol),
                            })),
                        );
                    } else {
                        setRows(matches);
                    }
                } else {
                    setRows(matches);
                }
                setStatus("ready");
            } catch {
                if (!controller.signal.aborted) setStatus("error");
            }
        };
        void load();
        return () => controller.abort();
    }, [query]);

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-4">
                <h1 className="text-3xl font-bold text-gray-900">Hasil pencarian</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Hasil saham Indonesia dan internasional untuk “{query}”
                </p>
                <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
                    {status === "loading" ? (
                        <p className="py-8 text-sm text-gray-500">Mencari saham...</p>
                    ) : status === "error" ? (
                        <p className="py-8 text-sm text-gray-500">Pencarian belum tersedia.</p>
                    ) : (
                        <StockTable rows={rows} empty="Tidak ada saham yang cocok." />
                    )}
                </section>
            </div>
        </main>
    );
}
