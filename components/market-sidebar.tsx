"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiRefreshLine } from "@remixicon/react";
import { Sparkline } from "@/components/sparkline";
import { formatJakartaTime } from "@/lib/format-time";

type MarketCategory = "trending" | "gainers" | "losers" | "active";

type MarketRow = {
    symbol: string;
    shortName?: string;
    regularMarketPrice?: number;
    regularMarketChangePercent?: number;
    regularMarketVolume?: number;
    averageDailyVolume3Month?: number;
    regularMarketTime?: string;
};

type MarketOverview = Record<MarketCategory, MarketRow[]>;

const sections: {
    id: MarketCategory;
    title: string;
    detail: string;
}[] = [
    {
        id: "trending",
        title: "Trending",
        detail: "Diurutkan menurut aktivitas volume",
    },
    {
        id: "gainers",
        title: "Top Gainers",
        detail: "Kenaikan harga terbesar",
    },
    {
        id: "losers",
        title: "Top Losers",
        detail: "Penurunan harga terbesar",
    },
    {
        id: "active",
        title: "Most Active",
        detail: "Diurutkan menurut volume perdagangan",
    },
];

const rupiah = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
});
const percent = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
function secondaryValue(row: MarketRow) {
    const change = row.regularMarketChangePercent;
    return typeof change === "number" ? `${change > 0 ? "+" : ""}${percent.format(change)}%` : "—";
}

export function MarketSidebar() {
    const [overview, setOverview] = useState<MarketOverview | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [retry, setRetry] = useState(0);
    const [sparklines, setSparklines] = useState<Record<string, number[]>>({});

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            try {
                const response = await fetch("/api/market/overview", {
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error("Market request failed");
                const data: MarketOverview = await response.json();
                if (!data || !sections.every(({ id }) => Array.isArray(data[id]))) {
                    throw new Error("Invalid market response");
                }
                setOverview(data);
                setStatus("ready");
                const symbols = [
                    ...new Set(sections.flatMap(({ id }) => data[id].map((row) => row.symbol))),
                ];
                if (symbols.length) {
                    try {
                        const charts = await fetch(
                            `/api/market/sparklines?symbols=${encodeURIComponent(symbols.join(","))}`,
                            { signal: controller.signal },
                        );
                        if (charts.ok) setSparklines(await charts.json());
                    } catch {
                        // Quotes remain usable when history is unavailable.
                    }
                }
            } catch {
                if (!controller.signal.aborted) setStatus("error");
            }
        };

        void load();
        return () => controller.abort();
    }, [retry]);

    return (
        <aside
            aria-labelledby="market-sidebar-title"
            className="min-w-0 self-start rounded-xl border border-gray-200 bg-white p-4"
        >
            <div>
                <h2 id="market-sidebar-title" className="text-lg font-bold text-gray-900">
                    Sorotan Saham
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                    Dari daftar saham Indonesia di MoneyMen
                </p>
                {status === "error" && (
                    <button
                        type="button"
                        onClick={() => {
                            setStatus("loading");
                            setRetry((value) => value + 1);
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:underline"
                    >
                        <RiRefreshLine aria-hidden="true" className="size-4" />
                        Coba lagi
                    </button>
                )}
            </div>

            <div className="mt-4 divide-y divide-gray-200">
                {sections.map(({ id, title, detail }) => {
                    const rows = overview?.[id] ?? [];
                    return (
                        <section
                            key={id}
                            aria-labelledby={`market-${id}`}
                            className="py-4 first:pt-0 last:pb-0"
                        >
                            <h3 id={`market-${id}`} className="text-sm font-bold text-gray-900">
                                {title}
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500">{detail}</p>

                            {status === "loading" && (
                                <p className="py-4 text-xs text-gray-500">Memuat data saham...</p>
                            )}
                            {status === "error" && (
                                <p className="py-4 text-xs text-gray-500">Data belum tersedia.</p>
                            )}
                            {status === "ready" && rows.length === 0 && (
                                <p className="py-4 text-xs text-gray-500">
                                    Belum ada saham di kategori ini.
                                </p>
                            )}
                            {status === "ready" && rows.length > 0 && (
                                <ol className="mt-2 divide-y divide-gray-100">
                                    {rows.map((row) => {
                                        const change = row.regularMarketChangePercent;
                                        const valueColor =
                                            typeof change === "number"
                                                ? change < 0
                                                    ? "text-red-600"
                                                    : "text-emerald-600"
                                                : "text-gray-600";
                                        return (
                                            <li key={row.symbol}>
                                                <Link
                                                    href={`/stocks/${row.symbol.replace(/\.JK$/, "")}`}
                                                    className="flex items-center justify-between gap-2 py-3 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-gray-700"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {row.symbol.replace(/\.JK$/, "")}
                                                        </p>
                                                        <p
                                                            className="truncate text-xs text-gray-500"
                                                            title={row.shortName}
                                                        >
                                                            {row.shortName ?? row.symbol}
                                                        </p>
                                                    </div>
                                                    <Sparkline
                                                        points={sparklines[row.symbol] ?? []}
                                                        positive={
                                                            typeof change === "number"
                                                                ? change >= 0
                                                                : true
                                                        }
                                                    />
                                                    <div className="shrink-0 text-right">
                                                        <p className="text-sm font-semibold tabular-nums text-gray-900">
                                                            {typeof row.regularMarketPrice ===
                                                            "number"
                                                                ? `Rp ${rupiah.format(row.regularMarketPrice)}`
                                                                : "—"}
                                                        </p>
                                                        <p
                                                            className={`text-xs font-semibold tabular-nums ${valueColor}`}
                                                        >
                                                            {secondaryValue(row)}
                                                        </p>
                                                        {formatJakartaTime(
                                                            row.regularMarketTime,
                                                            true,
                                                        ) && (
                                                            <time
                                                                dateTime={row.regularMarketTime}
                                                                className="block text-[10px] text-gray-500"
                                                            >
                                                                {formatJakartaTime(
                                                                    row.regularMarketTime,
                                                                    true,
                                                                )}
                                                            </time>
                                                        )}
                                                    </div>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ol>
                            )}
                        </section>
                    );
                })}
            </div>
        </aside>
    );
}
