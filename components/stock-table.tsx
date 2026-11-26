import Link from "next/link";
import { Sparkline } from "@/components/sparkline";
import { formatJakartaTime } from "@/lib/format-time";

export type StockRow = {
    symbol: string;
    shortName?: string;
    shortname?: string;
    longName?: string;
    regularMarketPrice?: number;
    regularMarketChangePercent?: number;
    regularMarketVolume?: number;
    currency?: string;
    quoteType?: string;
    regularMarketTime?: string;
};

const price = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
});
const percent = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
const volume = new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
});

export function StockTable({
    rows,
    empty = "Tidak ada data.",
    sparklines,
}: {
    rows: StockRow[];
    empty?: string;
    sparklines?: Record<string, number[]>;
}) {
    if (rows.length === 0) {
        return <p className="py-8 text-center text-sm text-gray-500">{empty}</p>;
    }

    return (
        <div className="overflow-x-auto mt-3">
            <table
                className={`w-full border-collapse text-left text-sm ${sparklines ? "min-w-165" : "min-w-140"}`}
            >
                <thead>
                    <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                        <th className="py-3 pr-4 font-semibold">Saham / Indeks</th>
                        <th className="py-3 pr-4 text-right font-semibold">Harga</th>
                        {sparklines && (
                            <th className="py-3 pr-4 text-center font-semibold">7 hari</th>
                        )}
                        <th className="py-3 pr-4 text-right font-semibold">Perubahan</th>
                        <th className="py-3 text-right font-semibold">Volume</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const local = row.symbol.endsWith(".JK");
                        const label = row.symbol.replace(/\.JK$/, "");
                        const name = row.longName ?? row.shortName ?? row.shortname ?? row.symbol;
                        const change = row.regularMarketChangePercent;
                        return (
                            <tr key={row.symbol} className="border-b border-gray-100 last:border-0">
                                <td className="py-3 pr-4">
                                    {local ? (
                                        <Link
                                            href={`/stocks/${label}`}
                                            className="font-bold text-gray-900 hover:underline"
                                        >
                                            {label}
                                        </Link>
                                    ) : (
                                        <Link
                                            href={`/stocks/${encodeURIComponent(row.symbol)}?market=ALL`}
                                            className="font-bold text-gray-900 hover:underline"
                                        >
                                            {label}
                                        </Link>
                                    )}
                                    <span className="ml-2 text-xs text-gray-500">
                                        {name !== row.symbol ? name : ""}
                                    </span>
                                </td>
                                <td className="py-3 pr-4 text-right tabular-nums text-gray-900">
                                    <span className="block">
                                        {typeof row.regularMarketPrice === "number"
                                            ? `${row.currency === "IDR" ? "Rp " : ""}${price.format(row.regularMarketPrice)}`
                                            : "—"}
                                    </span>
                                    {formatJakartaTime(row.regularMarketTime, true) && (
                                        <time
                                            dateTime={row.regularMarketTime}
                                            className="block text-[10px] text-gray-500"
                                        >
                                            {formatJakartaTime(row.regularMarketTime, true)}
                                        </time>
                                    )}
                                </td>
                                {sparklines && (
                                    <td className="py-3 pr-4">
                                        <div className="flex justify-center">
                                            <Sparkline
                                                points={sparklines[row.symbol] ?? []}
                                                positive={
                                                    typeof change === "number" ? change >= 0 : true
                                                }
                                            />
                                        </div>
                                    </td>
                                )}
                                <td
                                    className={`py-3 pr-4 text-right font-semibold tabular-nums ${typeof change === "number" ? (change < 0 ? "text-red-600" : "text-emerald-600") : "text-gray-400"}`}
                                >
                                    {typeof change === "number"
                                        ? `${change > 0 ? "+" : ""}${percent.format(change)}%`
                                        : "—"}
                                </td>
                                <td className="py-3 text-right tabular-nums text-gray-600">
                                    {typeof row.regularMarketVolume === "number"
                                        ? volume.format(row.regularMarketVolume)
                                        : "—"}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
