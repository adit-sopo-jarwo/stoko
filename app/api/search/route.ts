import { yahooFinance, respond, query, BadRequest, limit } from "@/lib/yahoo-finance";

export async function GET(request: Request) {
    return respond(async () => {
        const q = query(request);
        const term = q.get("q")?.trim();
        if (!term || term.length > 100) throw new BadRequest("q is required (max 100 characters)");
        const result = await yahooFinance.search(term, {
            quotesCount: limit(q),
            newsCount: 0,
        });
        return result.quotes.filter(
            (row) =>
                q.get("market") !== "ID" ||
                ("symbol" in row && typeof row.symbol === "string" && row.symbol.endsWith(".JK")),
        );
    });
}
