"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { RiNewspaperLine } from "@remixicon/react";
import { MarketSidebar } from "@/components/market-sidebar";
import { StockDataSections } from "@/components/stock-data-sections";
import { formatJakartaTime } from "@/lib/format-time";

type Quote = {
    symbol: string;
    shortName?: string;
    longName?: string;
    regularMarketPrice?: number;
    regularMarketChange?: number;
    regularMarketChangePercent?: number;
    regularMarketPreviousClose?: number;
    regularMarketVolume?: number;
    currency?: string;
    regularMarketTime?: string;
};

type HistoryPoint = { date: string; price: number };
type NewsItem = {
    uuid: string;
    title: string;
    publisher: string;
    link: string;
    providerPublishTime: string;
    relatedTickers?: string[];
    thumbnail?: {
        resolutions: {
            url: string;
            width: number;
            height: number;
        }[];
    };
};
type Range = "1d" | "7d" | "30d" | "90d" | "1y";

const ranges: Range[] = ["1d", "7d", "30d", "90d", "1y"];
const number = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
});
const percent = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function PriceChart({ points }: { points: HistoryPoint[] }) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const values = points.filter((point) => Number.isFinite(point.price));
    if (values.length < 2) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-gray-500">
                Grafik belum tersedia.
            </div>
        );
    }

    const width = 800;
    const height = 260;
    const prices = values.map((point) => point.price);
    const low = Math.min(...prices);
    const high = Math.max(...prices);
    const spread = high - low || 1;
    const coordinates = values.map((point, index) => ({
        x: (index / (values.length - 1)) * width,
        y: height - 16 - ((point.price - low) / spread) * (height - 32),
    }));
    const path = coordinates
        .map(({ x, y }, index) => `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
        .join(" ");
    const area = `${path} L ${width} ${height} L 0 ${height} Z`;
    const rising = prices.at(-1)! >= prices[0];
    const color = rising ? "#059669" : "#dc2626";
    const selectedIndex = activeIndex === null ? null : Math.min(activeIndex, values.length - 1);
    const selected = selectedIndex === null ? null : coordinates[selectedIndex];
    const selectedPoint = selectedIndex === null ? null : values[selectedIndex];

    return (
        <div className="relative">
            {selected && selectedPoint && (
                <div
                    className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg"
                    style={{
                        left: `${Math.max(16, Math.min(84, (selected.x / width) * 100))}%`,
                    }}
                >
                    <p>
                        {new Date(selectedPoint.date).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                        })}
                    </p>
                    <p className="mt-1 font-bold">Rp {number.format(selectedPoint.price)}</p>
                </div>
            )}
            <svg
                viewBox="0 0 800 260"
                preserveAspectRatio="none"
                className="h-64 w-full cursor-crosshair"
                role="img"
                aria-label="Grafik harga saham, arahkan kursor untuk melihat harga dan tanggal"
                onPointerMove={(event) => {
                    const bounds = event.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(
                        0,
                        Math.min(1, (event.clientX - bounds.left) / bounds.width),
                    );
                    setActiveIndex(Math.round(ratio * (values.length - 1)));
                }}
                onPointerLeave={() => setActiveIndex(null)}
            >
                <defs>
                    <linearGradient id="stock-chart-fill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={area} fill="url(#stock-chart-fill)" />
                <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                />
                <rect width={width} height={height} fill="transparent" />
                {selected && (
                    <>
                        <line
                            x1={selected.x}
                            x2={selected.x}
                            y1="0"
                            y2={height}
                            stroke="#9ca3af"
                            strokeDasharray="4 4"
                            vectorEffect="non-scaling-stroke"
                        />
                        <circle
                            cx={selected.x}
                            cy={selected.y}
                            r="5"
                            fill={color}
                            stroke="white"
                            strokeWidth="2"
                        />
                    </>
                )}
            </svg>
            <div className="flex justify-between text-xs text-gray-500">
                <span>{new Date(values[0].date).toLocaleDateString("id-ID")}</span>
                <span>{new Date(values.at(-1)!.date).toLocaleDateString("id-ID")}</span>
            </div>
        </div>
    );
}

function NewsThumbnail({ item }: { item: NewsItem }) {
    const resolutions = item.thumbnail?.resolutions ?? [];
    const source =
        resolutions.find((image) => image.width >= 400 && image.height >= 200) ??
        resolutions.find((image) => image.width >= 140) ??
        resolutions[0];
    const src =
        source && /^https:\/\/(media\.zenfs\.com|s\.yimg\.com)\//.test(source.url)
            ? source.url
            : null;

    return (
        <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-gray-100 sm:w-40">
            {src ? (
                <Image
                    src={src}
                    alt=""
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 112px, 160px"
                    className="object-cover"
                />
            ) : (
                <div className="flex size-full items-center justify-center text-gray-300">
                    <RiNewspaperLine aria-hidden="true" className="size-8" />
                </div>
            )}
        </div>
    );
}

export function StockDetail({ symbol, global }: { symbol: string; global: boolean }) {
    const marketQuery = global ? "?market=ALL" : "";
    const tickerSymbol = global ? symbol : `${symbol}.JK`;
    const [quote, setQuote] = useState<Quote | null>(null);
    const [history, setHistory] = useState<HistoryPoint[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [specificNews, setSpecificNews] = useState(false);
    const [range, setRange] = useState<Range>("90d");
    const [quoteError, setQuoteError] = useState(false);
    const [historyError, setHistoryError] = useState(false);
    const [newsError, setNewsError] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            try {
                const response = await fetch(`/api/stocks/${symbol}${marketQuery}`, {
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error("Quote unavailable");
                setQuote(await response.json());
            } catch {
                if (!controller.signal.aborted) setQuoteError(true);
            }
        };
        void load();
        return () => controller.abort();
    }, [symbol, marketQuery]);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            try {
                const response = await fetch(
                    `/api/stocks/${symbol}/history?range=${range}${global ? "&market=ALL" : ""}`,
                    {
                        signal: controller.signal,
                    },
                );
                if (!response.ok) throw new Error("History unavailable");
                const data: HistoryPoint[] = await response.json();
                setHistory(data);
                setHistoryError(false);
            } catch {
                if (!controller.signal.aborted) setHistoryError(true);
            }
        };
        void load();
        return () => controller.abort();
    }, [symbol, range, global]);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            try {
                const response = await fetch(
                    global
                        ? `/api/news?q=${encodeURIComponent(symbol)}&limit=20`
                        : "/api/news?limit=50",
                    { signal: controller.signal },
                );
                if (!response.ok) throw new Error("News unavailable");
                const articles: NewsItem[] = await response.json();
                const valid = articles.filter((item) => /^https?:\/\//i.test(item.link));
                const matching = valid.filter((item) =>
                    item.relatedTickers?.some((ticker) => ticker.toUpperCase() === tickerSymbol),
                );
                setSpecificNews(matching.length > 0);
                setNews((matching.length ? matching : valid).slice(0, 6));
            } catch {
                if (!controller.signal.aborted) setNewsError(true);
            }
        };
        void load();
        return () => controller.abort();
    }, [symbol, global, tickerSymbol]);

    const change = quote?.regularMarketChangePercent ?? 0;

    return (
        <main className="bg-gray-50">
            <div className="mx-auto grid w-full max-w-360 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,22%)] lg:px-4">
                <div className="min-w-0 space-y-8">
                    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
                        <p className="text-sm font-semibold text-gray-500">
                            {global ? "Saham internasional" : "Saham Indonesia"} · {tickerSymbol}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                            {quote?.longName ?? quote?.shortName ?? symbol}
                        </h1>
                        {quoteError ? (
                            <p className="mt-6 text-sm text-gray-500">
                                Harga saham belum tersedia.
                            </p>
                        ) : quote ? (
                            <>
                                <div className="mt-6 flex flex-wrap items-baseline gap-3">
                                    <span className="text-3xl font-bold tabular-nums text-gray-900">
                                        {quote.currency === "IDR" ? "Rp" : (quote.currency ?? "")}{" "}
                                        {number.format(quote.regularMarketPrice ?? 0)}
                                    </span>
                                    <span
                                        className={`text-sm font-semibold tabular-nums ${change < 0 ? "text-red-600" : "text-emerald-600"}`}
                                    >
                                        {(quote.regularMarketChange ?? 0) > 0 ? "+" : ""}
                                        {number.format(quote.regularMarketChange ?? 0)}
                                        {" · "}
                                        {change > 0 ? "+" : ""}
                                        {percent.format(change)}%
                                    </span>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-600">
                                    <span>
                                        Penutupan sebelumnya:{" "}
                                        {quote.currency === "IDR" ? "Rp" : (quote.currency ?? "")}{" "}
                                        {number.format(quote.regularMarketPreviousClose ?? 0)}
                                    </span>
                                    <span>
                                        Volume: {number.format(quote.regularMarketVolume ?? 0)}
                                    </span>
                                    {formatJakartaTime(quote.regularMarketTime) && (
                                        <span>
                                            Harga terakhir:{" "}
                                            <time dateTime={quote.regularMarketTime}>
                                                {formatJakartaTime(quote.regularMarketTime)}
                                            </time>
                                        </span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p className="mt-6 text-sm text-gray-500">Memuat harga saham...</p>
                        )}
                    </section>

                    <section
                        id="chart"
                        aria-labelledby="chart-title"
                        className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7"
                    >
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                            <h2 id="chart-title" className="text-xl font-bold text-gray-900">
                                Grafik Harga
                            </h2>
                            <div aria-label="Periode grafik" className="flex flex-wrap gap-1">
                                {ranges.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        aria-pressed={range === item}
                                        onClick={() => setRange(item)}
                                        className={`rounded px-3 py-1.5 text-xs font-semibold ${range === item ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                                    >
                                        {item.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {historyError ? (
                            <p className="py-20 text-center text-sm text-gray-500">
                                Grafik belum bisa dimuat.
                            </p>
                        ) : history.length ? (
                            <PriceChart points={history} />
                        ) : (
                            <p className="py-20 text-center text-sm text-gray-500">
                                Memuat grafik...
                            </p>
                        )}
                    </section>

                    <StockDataSections symbol={symbol} global={global} />
                    <section aria-labelledby="stock-news-title">
                        <h2 id="stock-news-title" className="text-xl font-bold text-gray-900">
                            {specificNews ? `Berita ${symbol}` : "Berita Pasar"}
                        </h2>
                        {!specificNews && !newsError && news.length > 0 && (
                            <p className="mt-1 text-sm text-gray-500">
                                Belum ada berita khusus {symbol}; berikut berita pasar terkait.
                            </p>
                        )}
                        {newsError ? (
                            <p className="mt-5 text-sm text-gray-500">Berita belum bisa dimuat.</p>
                        ) : news.length ? (
                            <div className="mt-4 divide-y divide-gray-200">
                                {news.map((item) => (
                                    <a
                                        key={item.uuid || item.link}
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex gap-4 py-4 first:pt-0 focus-visible:outline-2 focus-visible:outline-gray-700"
                                    >
                                        <NewsThumbnail item={item} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-gray-500">
                                                {item.publisher} ·{" "}
                                                <time dateTime={item.providerPublishTime}>
                                                    {formatJakartaTime(item.providerPublishTime)}
                                                </time>
                                            </p>
                                            <h3 className="mt-1 font-semibold text-gray-900 group-hover:underline">
                                                {item.title}
                                            </h3>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-5 text-sm text-gray-500">Memuat berita...</p>
                        )}
                    </section>
                </div>
                <MarketSidebar />
            </div>
        </main>
    );
}
