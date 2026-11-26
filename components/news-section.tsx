"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { RiArrowRightUpLine, RiNewspaperLine, RiRefreshLine } from "@remixicon/react";
import { MarketSidebar } from "@/components/market-sidebar";
import { formatJakartaTime } from "@/lib/format-time";

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

const topics = [
    { label: "Semua", pattern: /./ },
    { label: "Emiten", pattern: /stock|shares?|MSCI|Telkom|Freeport|listed|market/i },
    { label: "Ekonomi", pattern: /econom|invest|rupiah|trade|tariff|growth|rates?/i },
    { label: "Perbankan", pattern: /bank|rupiah|rates?|monetary/i },
    { label: "Komoditas", pattern: /Freeport|coal|mining|commodity|commodities|nickel|gold/i },
    { label: "Teknologi", pattern: /Telkom|chip|technology|digital|tech /i },
];

function publishedAt(value: string) {
    return formatJakartaTime(value) ?? "";
}

function NewsImage({
    item,
    featured = false,
    compact = false,
}: {
    item: NewsItem;
    featured?: boolean;
    compact?: boolean;
}) {
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
        <div
            className={`relative aspect-video shrink-0 overflow-hidden rounded-lg bg-gray-100 ${featured ? "w-full" : compact ? "w-24 sm:w-28" : "w-28 sm:w-40"}`}
        >
            {src ? (
                <Image
                    src={src}
                    alt=""
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            ) : (
                <div className="flex size-full items-center justify-center text-gray-300">
                    <RiNewspaperLine aria-hidden="true" className="size-10" />
                </div>
            )}
        </div>
    );
}

function NewsRow({ item, compact = false }: { item: NewsItem; compact?: boolean }) {
    return (
        <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex py-5 first:pt-0 last:pb-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 ${compact ? "gap-3" : "gap-4"}`}
        >
            <NewsImage item={item} compact={compact} />
            <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">{item.publisher}</span>
                    {" · "}
                    {publishedAt(item.providerPublishTime)}
                </p>
                <h3
                    className={`mt-2 line-clamp-3 font-semibold leading-snug text-gray-900 group-hover:underline ${compact ? "text-sm" : "text-sm sm:text-base"}`}
                >
                    {item.title}
                </h3>
                <span
                    className={`mt-auto items-center gap-1 pt-2 text-xs font-medium text-gray-500 ${compact ? "hidden" : "inline-flex"}`}
                >
                    Baca artikel <RiArrowRightUpLine aria-hidden="true" className="size-4" />
                </span>
            </div>
        </a>
    );
}

function FeaturedNews({ item }: { item: NewsItem }) {
    return (
        <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-gray-700"
        >
            <NewsImage item={item} featured />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Sorotan · {item.publisher} · {publishedAt(item.providerPublishTime)}
            </p>
            <h3 className="mt-2 text-xl font-bold leading-snug text-gray-900 group-hover:underline sm:text-2xl">
                {item.title}
            </h3>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gray-700">
                Baca artikel <RiArrowRightUpLine aria-hidden="true" className="size-4" />
            </span>
        </a>
    );
}

export function NewsSection({ fullPage = false }: { fullPage?: boolean }) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [retry, setRetry] = useState(0);
    const [topic, setTopic] = useState(0);
    const [visibleCount, setVisibleCount] = useState(20);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            try {
                const response = await fetch(`/api/news?limit=${fullPage ? 50 : 12}`, {
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error("News request failed");
                const result: NewsItem[] = await response.json();
                if (!Array.isArray(result)) throw new Error("Invalid news response");
                const valid = result.filter(
                    (item) =>
                        item &&
                        typeof item.title === "string" &&
                        typeof item.link === "string" &&
                        /^https?:\/\//i.test(item.link),
                );
                setNews(valid);
                setStatus("ready");
            } catch {
                if (!controller.signal.aborted) setStatus("error");
            }
        };

        void load();
        return () => controller.abort();
    }, [retry, fullPage]);

    const latestNews = news
        .slice(4)
        .filter((item) => !fullPage || topics[topic].pattern.test(item.title));

    return (
        <section id="news" aria-labelledby="news-title" className="w-full bg-gray-50">
            <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,22%)] lg:gap-8 lg:px-4">
                <div
                    className={`min-w-0 ${fullPage ? "grid grid-cols-1 content-start items-start gap-y-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] lg:gap-x-8" : ""}`}
                >
                    {fullPage && (
                        <div className="lg:col-span-2">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                Berita Pasar
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Berita pasar dan ekonomi Indonesia terbaru.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2" aria-label="Topik berita">
                                {topics.map((item, index) => (
                                    <button
                                        key={item.label}
                                        type="button"
                                        aria-pressed={topic === index}
                                        onClick={() => {
                                            setTopic(index);
                                            setVisibleCount(20);
                                        }}
                                        className={`rounded-full border px-3 py-1.5 text-sm font-medium ${topic === index ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"}`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <section
                        id={fullPage ? "top-news" : "latest-news"}
                        aria-labelledby={fullPage ? "top-news-title" : "latest-news-title"}
                        className={`scroll-mt-6 ${fullPage ? "order-2 border-t border-gray-200 pt-7 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0" : "mb-10"}`}
                    >
                        <h2
                            id={fullPage ? "top-news-title" : "latest-news-title"}
                            className="mb-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
                        >
                            {fullPage ? "Berita Utama" : "Latest News"}
                        </h2>
                        {status === "loading" && (
                            <p className="text-sm text-gray-500">Memuat berita terbaru...</p>
                        )}
                        {status === "ready" &&
                            news.length > 0 &&
                            (fullPage ? (
                                <div>
                                    <FeaturedNews item={news[0]} />
                                    <div className="mt-5 divide-y divide-gray-200 border-t border-gray-200 pt-4">
                                        {news.slice(1, 4).map((item) => (
                                            <NewsRow
                                                key={item.uuid || item.link}
                                                item={item}
                                                compact
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {news.slice(0, 4).map((item) => (
                                        <NewsRow key={item.uuid || item.link} item={item} />
                                    ))}
                                </div>
                            ))}
                    </section>
                    <div className={`min-w-0 ${fullPage ? "order-1" : ""}`}>
                        <div
                            id={fullPage ? "latest-news" : undefined}
                            className="mb-6 flex scroll-mt-6 flex-wrap items-end justify-between gap-4"
                        >
                            <div>
                                <h2
                                    id="news-title"
                                    className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
                                >
                                    {fullPage ? "Berita Terbaru" : "Berita Pasar"}
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    {fullPage && topic !== 0
                                        ? `Topik ${topics[topic].label} · `
                                        : ""}
                                    Berita terkait pasar saham Indonesia.
                                </p>
                            </div>
                        </div>

                        {status === "loading" && (
                            <div className="divide-y divide-gray-200" aria-label="Memuat berita">
                                {Array.from({ length: 6 }, (_, index) => (
                                    <div key={index} className="flex animate-pulse gap-4 py-5">
                                        <div className="aspect-video w-28 shrink-0 rounded bg-gray-200 sm:w-40" />
                                        <div className="flex-1">
                                            <div className="mb-4 h-3 w-1/3 rounded bg-gray-200" />
                                            <div className="mb-2 h-4 w-full rounded bg-gray-200" />
                                            <div className="h-4 w-3/4 rounded bg-gray-200" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {status === "error" && (
                            <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
                                <p>Berita belum bisa dimuat.</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatus("loading");
                                        setRetry((value) => value + 1);
                                    }}
                                    className="mt-3 inline-flex items-center gap-2 font-semibold text-gray-900 hover:underline"
                                >
                                    <RiRefreshLine aria-hidden="true" className="size-4" />
                                    Coba lagi
                                </button>
                            </div>
                        )}

                        {status === "ready" &&
                            (fullPage ? latestNews.length === 0 : news.length === 0) && (
                                <p className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
                                    Belum ada berita untuk topik ini.
                                </p>
                            )}

                        {status === "ready" && latestNews.length > 0 && (
                            <div className="divide-y divide-gray-200">
                                {latestNews
                                    .slice(0, fullPage ? visibleCount - 4 : undefined)
                                    .map((item) => (
                                        <NewsRow
                                            key={item.uuid || item.link}
                                            item={item}
                                            compact={fullPage}
                                        />
                                    ))}
                            </div>
                        )}
                        {fullPage && status === "ready" && latestNews.length > visibleCount - 4 && (
                            <button
                                type="button"
                                onClick={() => setVisibleCount((count) => count + 20)}
                                className="mt-6 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
                            >
                                Muat lebih banyak
                            </button>
                        )}
                    </div>
                </div>
                <MarketSidebar />
            </div>
        </section>
    );
}
