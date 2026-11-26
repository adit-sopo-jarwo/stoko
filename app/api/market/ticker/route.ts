import { yahooFinance } from "@/lib/yahoo-finance";
import { IDX_SYMBOLS } from "@/lib/stock-symbols";

const instruments = IDX_SYMBOLS.slice(0, 12).map((symbol) => ({
    name: symbol.replace(/\.JK$/, ""),
    symbol,
}));

export async function GET() {
    try {
        const quotes = await yahooFinance.quote(instruments.map(({ symbol }) => symbol));
        const quoteBySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));
        const period2 = new Date();
        const period1 = new Date(period2.getTime() - 7 * 86400000);

        const data = await Promise.all(
            instruments.map(async ({ name, symbol }) => {
                const quote = quoteBySymbol.get(symbol);
                let sparkline: number[] = [];

                try {
                    const chart = await yahooFinance.chart(symbol, {
                        period1,
                        period2,
                        interval: "1h",
                    });
                    sparkline = chart.quotes
                        .map((point) => point.close)
                        .filter((price): price is number => typeof price === "number")
                        .slice(-48);
                } catch (error) {
                    console.error(`Ticker history unavailable for ${symbol}:`, error);
                }

                return {
                    name,
                    symbol,
                    price: quote?.regularMarketPrice ?? null,
                    change: quote?.regularMarketChange ?? null,
                    changePercent: quote?.regularMarketChangePercent ?? null,
                    marketTime: quote?.regularMarketTime ?? null,
                    sparkline,
                };
            }),
        );

        return Response.json(data, {
            headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
            },
        });
    } catch (error) {
        console.error("Market ticker unavailable:", error);
        return Response.json({ error: "Market ticker unavailable" }, { status: 502 });
    }
}
