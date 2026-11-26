"use client";

import { useEffect, useRef, useState } from "react";

const sections = [
    { id: "profile", title: "Profil Perusahaan" },
    { id: "financials", title: "Laporan Keuangan" },
    { id: "dividends", title: "Dividen dan Stock Split" },
    { id: "statistics", title: "Statistik Saham" },
    { id: "insights", title: "Insights" },
    { id: "options", title: "Options" },
    { id: "recommendations", title: "Rekomendasi Analis" },
] as const;

function label(key: string) {
    return key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function DataView({ value, depth = 0 }: { value: unknown; depth?: number }) {
    if (value === null || value === undefined) return <span className="text-gray-400">—</span>;
    if (typeof value === "boolean") return <span>{value ? "Ya" : "Tidak"}</span>;
    if (typeof value === "number")
        return (
            <span className="tabular-nums">
                {new Intl.NumberFormat("id-ID", {
                    maximumFractionDigits: 3,
                }).format(value)}
            </span>
        );
    if (typeof value === "string") return <span className="break-words">{value}</span>;
    if (depth >= 3) return <span className="text-gray-500">Data tambahan tersedia di API</span>;

    if (Array.isArray(value)) {
        if (value.length === 0) return <span className="text-gray-400">Belum ada data</span>;
        return (
            <div className="space-y-2">
                {value.slice(0, 12).map((item, index) => (
                    <div key={index} className="rounded-md bg-gray-50 p-3">
                        <DataView value={item} depth={depth + 1} />
                    </div>
                ))}
                {value.length > 12 && (
                    <p className="text-xs text-gray-500">
                        Menampilkan 12 dari {value.length} entri.
                    </p>
                )}
            </div>
        );
    }

    if (typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>).filter(
            ([, item]) => item !== null && item !== undefined,
        );
        if (entries.length === 0) return <span className="text-gray-400">Belum ada data</span>;
        return (
            <dl className="divide-y divide-gray-100">
                {entries.slice(0, 24).map(([key, item]) => (
                    <div
                        key={key}
                        className="grid gap-1 py-2 text-sm sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4"
                    >
                        <dt className="font-medium text-gray-500">{label(key)}</dt>
                        <dd className="min-w-0 text-gray-800">
                            <DataView value={item} depth={depth + 1} />
                        </dd>
                    </div>
                ))}
                {entries.length > 24 && (
                    <p className="py-2 text-xs text-gray-500">
                        Menampilkan 24 dari {entries.length} bidang.
                    </p>
                )}
            </dl>
        );
    }
    return null;
}

function DataPanel({
    symbol,
    global,
    id,
    title,
}: {
    symbol: string;
    global: boolean;
    id: string;
    title: string;
}) {
    const detailsRef = useRef<HTMLDetailsElement>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
    const [data, setData] = useState<unknown>(null);

    const load = async () => {
        if (status !== "idle") return;
        setStatus("loading");
        try {
            const response = await fetch(
                `/api/stocks/${symbol}/${id}${global ? "?market=ALL" : ""}`,
            );
            if (!response.ok) throw new Error("Data unavailable");
            setData(await response.json());
            setStatus("ready");
        } catch {
            setStatus("error");
        }
    };

    useEffect(() => {
        const openFromHash = () => {
            if (window.location.hash === `#${id}` && detailsRef.current) {
                detailsRef.current.open = true;
                detailsRef.current.scrollIntoView({
                    block: "start",
                });
            }
        };
        openFromHash();
        window.addEventListener("hashchange", openFromHash);
        return () => window.removeEventListener("hashchange", openFromHash);
    }, [id]);

    return (
        <details
            ref={detailsRef}
            id={id}
            onToggle={(event) => {
                if (event.currentTarget.open) void load();
            }}
            className="scroll-mt-6 rounded-xl border border-gray-200 bg-white"
        >
            <summary className="cursor-pointer px-5 py-4 text-base font-bold text-gray-900 marker:text-gray-500">
                {title}
            </summary>
            <div className="border-t border-gray-100 px-5 py-4">
                {status === "loading" && <p className="text-sm text-gray-500">Memuat data...</p>}
                {status === "error" && (
                    <p className="text-sm text-gray-500">Data ini belum tersedia untuk {symbol}.</p>
                )}
                {status === "ready" && <DataView value={data} />}
            </div>
        </details>
    );
}

export function StockDataSections({ symbol, global }: { symbol: string; global: boolean }) {
    return (
        <section aria-labelledby="stock-data-title">
            <h2 id="stock-data-title" className="mb-4 text-xl font-bold text-gray-900">
                Data Saham Lainnya
            </h2>
            <div className="space-y-3">
                {sections.map((section) => (
                    <DataPanel key={section.id} symbol={symbol} global={global} {...section} />
                ))}
            </div>
        </section>
    );
}
