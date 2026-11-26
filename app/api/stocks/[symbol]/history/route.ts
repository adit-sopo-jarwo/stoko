import {
    yahooFinance,
    respond,
    query,
    ticker,
    BadRequest,
    type StockContext,
} from "@/lib/yahoo-finance";

export async function GET(request: Request, context: StockContext) {
    return respond(async () => {
        const q = query(request);
        const ranges = {
            "1d": 1,
            "7d": 7,
            "30d": 30,
            "90d": 90,
            "180d": 180,
            "1y": 365,
            "5y": 1825,
        } as const;
        const range = q.get("range") ?? "90d";
        if (!Object.hasOwn(ranges, range)) throw new BadRequest("Invalid range");
        const days = ranges[range as keyof typeof ranges];
        const interval = q.get("interval") ?? (range === "1d" ? "5m" : "1d");
        const intervals = ["1m", "5m", "15m", "30m", "1h", "1d", "1wk", "1mo"] as const;
        if (!intervals.some((i) => i === interval)) throw new BadRequest("Invalid interval");
        if (
            (interval === "1m" && days > 7) ||
            (["5m", "15m", "30m"].includes(interval) && days > 60) ||
            (interval === "1h" && days > 730)
        )
            throw new BadRequest("Intraday range too long");
        const period2 = new Date();
        const period1 = new Date(period2.getTime() - days * 86400000);
        const result = await yahooFinance.chart(await ticker(request, context), {
            period1,
            period2,
            interval: interval as (typeof intervals)[number],
        });
        return result.quotes
            .filter((item) => item.close != null)
            .map((item) => ({
                date: item.date.toISOString(),
                price: item.close,
                open: item.open ?? null,
                high: item.high ?? null,
                low: item.low ?? null,
                volume: item.volume ?? null,
                adjclose: item.adjclose ?? null,
            }));
    });
}
