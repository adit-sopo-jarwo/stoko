import { yahooFinance, query, limit, BadRequest } from "@/lib/yahoo-finance";
import { IDX_SYMBOLS } from "@/lib/stock-symbols";
export async function marketQuotes() {
    return yahooFinance.quote(IDX_SYMBOLS);
}
export async function marketOverview(count = 5) {
    const quotes = await marketQuotes();
    const withChange = quotes.filter((q) => typeof q.regularMarketChangePercent === "number");
    const withVolume = quotes.filter((q) => typeof q.regularMarketVolume === "number");
    const withRelativeVolume = quotes.filter(
        (q) =>
            typeof q.regularMarketVolume === "number" &&
            typeof q.averageDailyVolume3Month === "number" &&
            q.averageDailyVolume3Month > 0,
    );

    return {
        universe: "IDX starter watchlist",
        universeSize: IDX_SYMBOLS.length,
        trendingBasis: "Volume dibanding rata-rata harian 3 bulan",
        trending: withRelativeVolume
            .sort(
                (a, b) =>
                    b.regularMarketVolume! / b.averageDailyVolume3Month! -
                    a.regularMarketVolume! / a.averageDailyVolume3Month!,
            )
            .slice(0, count),
        gainers: withChange
            .filter((q) => q.regularMarketChangePercent! > 0)
            .sort((a, b) => b.regularMarketChangePercent! - a.regularMarketChangePercent!)
            .slice(0, count),
        losers: withChange
            .filter((q) => q.regularMarketChangePercent! < 0)
            .sort((a, b) => a.regularMarketChangePercent! - b.regularMarketChangePercent!)
            .slice(0, count),
        active: withVolume
            .sort((a, b) => b.regularMarketVolume! - a.regularMarketVolume!)
            .slice(0, count),
    };
}
export async function ranked(request: Request, mode: "gainers" | "losers" | "active") {
    const n = limit(query(request));
    const quotes = await marketQuotes();
    const data =
        mode === "active"
            ? quotes
                  .filter((q) => typeof q.regularMarketVolume === "number")
                  .sort((a, b) => b.regularMarketVolume! - a.regularMarketVolume!)
            : quotes
                  .filter(
                      (q) =>
                          typeof q.regularMarketChangePercent === "number" &&
                          (mode === "gainers"
                              ? q.regularMarketChangePercent > 0
                              : q.regularMarketChangePercent < 0),
                  )
                  .sort((a, b) =>
                      mode === "gainers"
                          ? b.regularMarketChangePercent! - a.regularMarketChangePercent!
                          : a.regularMarketChangePercent! - b.regularMarketChangePercent!,
                  );
    return {
        universe: "IDX starter watchlist",
        universeSize: IDX_SYMBOLS.length,
        data: data.slice(0, n),
    };
}
export async function screen(request: Request) {
    const q = query(request);
    const n = limit(q);
    const minPrice = Number(q.get("minPrice") ?? 0);
    const maxPE = q.has("maxPE") ? Number(q.get("maxPE")) : Infinity;
    if (
        !Number.isFinite(minPrice) ||
        minPrice < 0 ||
        (q.has("maxPE") && (!Number.isFinite(maxPE) || maxPE <= 0))
    )
        throw new BadRequest("Invalid filter");
    const rows = await marketQuotes();
    return {
        universe: "IDX starter watchlist",
        data: rows
            .filter(
                (r) =>
                    typeof r.regularMarketPrice === "number" &&
                    r.regularMarketPrice >= minPrice &&
                    (!q.has("maxPE") ||
                        (typeof r.trailingPE === "number" &&
                            r.trailingPE > 0 &&
                            r.trailingPE <= maxPE)),
            )
            .slice(0, n),
    };
}
