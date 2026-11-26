import { io } from "next/cache";
import { IDX_SYMBOLS, INDEX_SYMBOLS } from "@/lib/stock-symbols";
import { yahooFinance } from "@/lib/yahoo-finance";

export async function GET(request: Request) {
    await io();
    const symbols = [
        ...new Set(new URL(request.url).searchParams.get("symbols")?.split(",") ?? []),
    ];
    if (
        symbols.length === 0 ||
        symbols.length > 30 ||
        symbols.some((symbol) => ![...IDX_SYMBOLS, ...INDEX_SYMBOLS].includes(symbol))
    ) {
        return Response.json({ error: "Invalid symbols" }, { status: 400 });
    }

    const period2 = new Date();
    const period1 = new Date(period2.getTime() - 7 * 86400000);
    const entries = await Promise.all(
        symbols.map(async (symbol): Promise<[string, number[]]> => {
            try {
                const chart = await yahooFinance.chart(symbol, {
                    period1,
                    period2,
                    interval: "1h",
                });
                return [
                    symbol,
                    chart.quotes
                        .map((point) => point.close)
                        .filter((value): value is number => typeof value === "number")
                        .slice(-48),
                ];
            } catch {
                return [symbol, []];
            }
        }),
    );

    return Response.json(Object.fromEntries(entries), {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
}
