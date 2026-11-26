"use client";

import { useEffect, useState } from "react";
import { StockTable, type StockRow } from "@/components/stock-table";
import { Input } from "@/components/ui/input";
import { IDX_LIST_SYMBOLS } from "@/lib/stock-symbols";

const PAGE_SIZE = 20;
const pageCount = Math.ceil(IDX_LIST_SYMBOLS.length / PAGE_SIZE);

export function StockList() {
    const [rows, setRows] = useState<StockRow[]>([]);
    const [search, setSearch] = useState("");
    const [searchRows, setSearchRows] = useState<StockRow[]>([]);
    const [searchStatus, setSearchStatus] = useState<"loading" | "ready" | "error">("ready");
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

    useEffect(() => {
        const controller = new AbortController();
        fetch(`/api/stocks?limit=${PAGE_SIZE}&page=${page}`, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error("Stocks unavailable");
                return response.json();
            })
            .then((data: StockRow[]) => {
                setRows(data);
                setStatus("ready");
            })
            .catch(() => {
                if (!controller.signal.aborted) setStatus("error");
            });
        return () => controller.abort();
    }, [page]);

    useEffect(() => {
        const term = search.trim();
        if (!term) return;
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=30`, {
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error("Search unavailable");
                const results: StockRow[] = await response.json();
                const matches = results.filter(
                    (row) =>
                        row.quoteType === "EQUITY" &&
                        /^[A-Z0-9^][A-Z0-9.^=\-]{0,29}$/.test(row.symbol),
                );
                const symbols = matches.map((row) => row.symbol);
                if (symbols.length) {
                    const quotes = await fetch(
                        `/api/stocks?market=ALL&symbols=${encodeURIComponent(symbols.join(","))}`,
                        { signal: controller.signal },
                    );
                    if (quotes.ok) {
                        const quoted: StockRow[] = await quotes.json();
                        const bySymbol = new Map(quoted.map((row) => [row.symbol, row]));
                        setSearchRows(
                            matches.map((row) => ({
                                ...row,
                                ...bySymbol.get(row.symbol),
                            })),
                        );
                    } else {
                        setSearchRows(matches);
                    }
                } else {
                    setSearchRows([]);
                }
                setSearchStatus("ready");
            } catch {
                if (!controller.signal.aborted) setSearchStatus("error");
            }
        }, 300);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [search]);

    function goToPage(nextPage: number) {
        setStatus("loading");
        setPage(nextPage);
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto w-full max-w-360 px-4 py-8 sm:px-6 lg:px-4">
                <h1 className="text-3xl font-bold text-gray-900">Daftar Saham Indonesia</h1>
                <p className="mt-1 text-sm text-gray-600">
                    {IDX_LIST_SYMBOLS.length} saham pilihan dari Bursa Efek Indonesia. Pencarian
                    juga mencakup saham internasional.
                </p>
                <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
                    <label className="block max-w-sm text-sm font-semibold text-gray-700">
                        Cari saham Indonesia atau internasional
                        <Input
                            type="search"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setSearchStatus("loading");
                            }}
                            placeholder="Contoh: BBCA atau NVDA"
                            className="mt-2 h-10 rounded-lg bg-white"
                        />
                    </label>
                    <h2 className="mt-6 text-lg font-semibold text-gray-900">
                        {search.trim() ? "Hasil pencarian semua pasar" : "Saham pilihan Indonesia"}
                    </h2>
                    <div className="mt-3">
                        {search.trim() ? (
                            searchStatus === "loading" ? (
                                <p className="py-8 text-sm text-gray-500">Mencari saham...</p>
                            ) : searchStatus === "error" ? (
                                <p className="py-8 text-sm text-gray-500">
                                    Pencarian belum tersedia.
                                </p>
                            ) : (
                                <StockTable rows={searchRows} empty="Tidak ada saham yang cocok." />
                            )
                        ) : status === "loading" ? (
                            <p className="py-8 text-sm text-gray-500">Memuat daftar saham...</p>
                        ) : status === "error" ? (
                            <p className="py-8 text-sm text-gray-500">
                                Daftar saham belum tersedia.
                            </p>
                        ) : (
                            <StockTable rows={rows} />
                        )}
                    </div>
                    {!search.trim() && (
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                            <p className="text-sm text-gray-600">
                                Halaman {page} dari {pageCount} · {PAGE_SIZE} saham per halaman
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => goToPage(page - 1)}
                                    disabled={page === 1 || status === "loading"}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Sebelumnya
                                </button>
                                <button
                                    type="button"
                                    onClick={() => goToPage(page + 1)}
                                    disabled={page === pageCount || status === "loading"}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Berikutnya
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
