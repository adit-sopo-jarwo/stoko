"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { MarketSidebar } from "@/components/market-sidebar";
import { StockTable, type StockRow } from "@/components/stock-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SCREENER_PAGE_SIZE = 10;

function useMarketSparklines(rows: StockRow[]) {
    const [sparklines, setSparklines] = useState<Record<string, number[]>>({});

    useEffect(() => {
        if (rows.length === 0) return;
        const controller = new AbortController();
        const symbols = rows.map((row) => row.symbol).join(",");
        fetch(`/api/market/sparklines?symbols=${encodeURIComponent(symbols)}`, {
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) throw new Error("Charts unavailable");
                return response.json();
            })
            .then((data: Record<string, number[]>) => setSparklines(data))
            .catch(() => {});
        return () => controller.abort();
    }, [rows]);

    return sparklines;
}

export function MarketDashboard() {
    const [indices, setIndices] = useState<StockRow[]>([]);
    const [indicesError, setIndicesError] = useState(false);
    const [screened, setScreened] = useState<StockRow[]>([]);
    const [screenerError, setScreenerError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [minPrice, setMinPrice] = useState("");
    const [maxPE, setMaxPE] = useState("");
    const [page, setPage] = useState(1);
    const pageCount = Math.ceil(screened.length / SCREENER_PAGE_SIZE);
    const visibleStocks = useMemo(
        () => screened.slice((page - 1) * SCREENER_PAGE_SIZE, page * SCREENER_PAGE_SIZE),
        [screened, page],
    );
    const indexSparklines = useMarketSparklines(indices);
    const stockSparklines = useMarketSparklines(visibleStocks);

    useEffect(() => {
        const controller = new AbortController();
        fetch("/api/market/indices", {
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) throw new Error("Indices unavailable");
                return response.json();
            })
            .then((data: StockRow[]) => setIndices(data))
            .catch(() => {
                if (!controller.signal.aborted) setIndicesError(true);
            });
        return () => controller.abort();
    }, []);

    const loadScreener = async (params = new URLSearchParams()) => {
        params.set("limit", "30");
        try {
            const response = await fetch(`/api/market/screener?${params}`);
            if (!response.ok) throw new Error("Screener unavailable");
            const result: { data: StockRow[] } = await response.json();
            setScreened(result.data);
        } catch {
            setScreenerError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetch("/api/market/screener?limit=30", {
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) throw new Error("Screener unavailable");
                return response.json();
            })
            .then((result: { data: StockRow[] }) => {
                setScreened(result.data);
                setLoading(false);
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setScreenerError(true);
                    setLoading(false);
                }
            });
        return () => controller.abort();
    }, []);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setScreenerError(false);
        setPage(1);
        const params = new URLSearchParams();
        if (minPrice.trim()) params.set("minPrice", minPrice.trim());
        if (maxPE.trim()) params.set("maxPE", maxPE.trim());
        void loadScreener(params);
    };

    return (
        <main className="bg-gray-50">
            <div className="mx-auto grid w-full max-w-360 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,22%)] lg:px-4">
                <div className="min-w-0 space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Pasar Saham</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Indeks dan penyaring saham Indonesia.
                        </p>
                    </div>
                    <section
                        id="indices"
                        className="scroll-mt-6 rounded-xl border border-gray-200 bg-white p-5"
                    >
                        <h2 className="text-xl font-bold text-gray-900">Indeks Pasar</h2>
                        {indicesError ? (
                            <p className="py-8 text-sm text-gray-500">Indeks belum tersedia.</p>
                        ) : indices.length ? (
                            <StockTable rows={indices} sparklines={indexSparklines} />
                        ) : (
                            <p className="py-8 text-sm text-gray-500">Memuat indeks...</p>
                        )}
                    </section>
                    <section
                        id="screener"
                        className="scroll-mt-6 rounded-xl border border-gray-200 bg-white p-5"
                    >
                        <h2 className="text-xl font-bold text-gray-900">Penyaring Saham</h2>
                        <form onSubmit={submit} className="mt-4 flex flex-wrap items-end gap-3">
                            <label className="min-w-32 flex-1 text-xs font-semibold text-gray-600">
                                Harga minimum
                                <Input
                                    type="number"
                                    min="0"
                                    value={minPrice}
                                    onChange={(event) => setMinPrice(event.target.value)}
                                    placeholder="Rp 0"
                                    className="mt-1 h-9 rounded-lg bg-white"
                                />
                            </label>
                            <label className="min-w-32 flex-1 text-xs font-semibold text-gray-600">
                                Batas rasio harga/laba (P/E)
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={maxPE}
                                    onChange={(event) => setMaxPE(event.target.value)}
                                    placeholder="Semua"
                                    className="mt-1 h-9 rounded-lg bg-white"
                                />
                            </label>
                            <Button type="submit" className="h-9 rounded-lg px-4">
                                Terapkan
                            </Button>
                        </form>
                        {screenerError ? (
                            <p className="py-8 text-sm text-gray-500">
                                Data penyaring saham belum tersedia.
                            </p>
                        ) : loading ? (
                            <p className="py-8 text-sm text-gray-500">Memuat saham...</p>
                        ) : (
                            <StockTable
                                rows={visibleStocks}
                                sparklines={stockSparklines}
                                empty="Tidak ada saham yang cocok."
                            />
                        )}
                        {!loading && !screenerError && screened.length > 0 && (
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                                <p className="text-sm text-gray-600">
                                    Halaman {page} dari {pageCount} · {screened.length} saham cocok
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPage((value) => value - 1)}
                                        disabled={page === 1}
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Sebelumnya
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPage((value) => value + 1)}
                                        disabled={page === pageCount}
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Berikutnya
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
                <MarketSidebar />
            </div>
        </main>
    );
}
