"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { IDX_SYMBOLS } from "@/lib/stock-symbols";
import { Sparkline } from "@/components/sparkline";
import { formatJakartaTime } from "@/lib/format-time";

type TickerItem = {
    name: string;
    symbol: string;
    price: number | null;
    change: number | null;
    changePercent: number | null;
    marketTime: string | null;
    sparkline: number[];
};

const placeholderItems: TickerItem[] = IDX_SYMBOLS.slice(0, 12).map((symbol) => ({
    name: symbol.replace(/\.JK$/, ""),
    symbol,
    price: null,
    change: null,
    changePercent: null,
    marketTime: null,
    sparkline: [],
}));

function formatNumber(value: number | null, digits = 2) {
    return value === null
        ? "—"
        : new Intl.NumberFormat("id-ID", {
              minimumFractionDigits: digits,
              maximumFractionDigits: digits,
          }).format(value);
}

export function MarketTicker() {
    const [items, setItems] = useState<TickerItem[]>([]);
    const [error, setError] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const scroller = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = scroller.current;
        if (!element) return;

        const updateButtons = () => {
            setCanScrollLeft(element.scrollLeft > 1);
            setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 1);
        };

        updateButtons();
        element.addEventListener("scroll", updateButtons, {
            passive: true,
        });
        const observer = new ResizeObserver(updateButtons);
        observer.observe(element);
        return () => {
            element.removeEventListener("scroll", updateButtons);
            observer.disconnect();
        };
    }, [items.length]);

    const scroll = (direction: -1 | 1) => {
        const element = scroller.current;
        if (!element) return;
        element.scrollBy({
            left: direction * Math.max(172, element.clientWidth - 172),
            behavior: "smooth",
        });
    };

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const response = await fetch("/api/market/ticker");
                if (!response.ok) throw new Error("Ticker request failed");
                const data: TickerItem[] = await response.json();
                if (active) {
                    setItems(data);
                    setError(false);
                }
            } catch {
                if (active) setError(true);
            }
        };

        void load();
        const interval = window.setInterval(load, 60_000);
        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, []);

    return (
        <section
            id="ticker"
            aria-label="Harga saham Indonesia"
            className="border-b border-gray-200 bg-white text-gray-900"
        >
            <div className="relative mx-auto flex w-full max-w-[1440px] items-center">
                <div
                    ref={scroller}
                    className="flex min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar-none [&::-webkit-scrollbar]:hidden"
                >
                    {(items.length ? items : placeholderItems).map((item) => {
                        const movement = item.changePercent ?? item.change ?? 0;
                        const positive = movement > 0;
                        const negative = movement < 0;
                        return (
                            <Link
                                key={item.symbol}
                                href={`/stocks/${item.symbol.replace(/\.JK$/, "")}`}
                                className="flex h-20 min-w-43 snap-start flex-col justify-center gap-0.5 border-r border-gray-200 px-4 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-gray-700"
                            >
                                <span className="truncate text-xs font-semibold text-gray-700">
                                    {item.name}
                                </span>
                                <div className="flex items-center justify-between gap-1">
                                    <div className="min-w-0">
                                        <div className="text-[13px] font-bold leading-4 tabular-nums">
                                            {item.price === null
                                                ? "—"
                                                : `Rp ${formatNumber(item.price, 0)}`}
                                        </div>
                                        <div
                                            className={`whitespace-nowrap text-xs font-semibold tabular-nums ${positive ? "text-emerald-600" : negative ? "text-red-600" : "text-gray-500"}`}
                                        >
                                            {item.change === null
                                                ? error
                                                    ? "Data tidak tersedia"
                                                    : "Memuat..."
                                                : `${item.change > 0 ? "+" : ""}${formatNumber(item.change, 0)}  ${item.changePercent !== null && item.changePercent > 0 ? "+" : ""}${formatNumber(item.changePercent, 2)}%`}
                                        </div>
                                    </div>
                                    <Sparkline
                                        points={item.sparkline}
                                        positive={positive}
                                        neutral={!positive && !negative}
                                    />
                                </div>
                                {formatJakartaTime(item.marketTime, true) && (
                                    <time
                                        dateTime={item.marketTime ?? undefined}
                                        className="block whitespace-nowrap text-[10px] leading-3 text-gray-500"
                                    >
                                        {formatJakartaTime(item.marketTime, true)}
                                    </time>
                                )}
                            </Link>
                        );
                    })}
                </div>
                <div className="flex h-20 shrink-0 items-center gap-1 border-l border-gray-200 bg-gray-50 px-2">
                    <button
                        type="button"
                        aria-label="Saham sebelumnya"
                        disabled={!canScrollLeft}
                        onClick={() => scroll(-1)}
                        className="rounded p-1 text-gray-600 hover:bg-gray-200 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        <RiArrowLeftSLine className="size-5" />
                    </button>
                    <button
                        type="button"
                        aria-label="Saham berikutnya"
                        disabled={!canScrollRight}
                        onClick={() => scroll(1)}
                        className="rounded p-1 text-gray-600 hover:bg-gray-200 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        <RiArrowRightSLine className="size-5" />
                    </button>
                </div>
            </div>
        </section>
    );
}
