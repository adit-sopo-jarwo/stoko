import { yahooFinance, respond, query, BadRequest, limit } from "@/lib/yahoo-finance";

export async function GET(request: Request) {
    return respond(async () => {
        const q = query(request);
        const term = q.get("q")?.trim();
        if (term && term.length > 100) throw new BadRequest("q too long");
        const count = limit(q);
        if (term) {
            const result = await yahooFinance.search(term, {
                quotesCount: 0,
                newsCount: count,
            });
            return result.news;
        }

        const [market, indonesia] = await Promise.all([
            yahooFinance.search("IDX Composite", {
                quotesCount: 0,
                newsCount: 30,
            }),
            yahooFinance.search("Indonesia", {
                quotesCount: 0,
                newsCount: 100,
            }),
        ]);
        const relevant = indonesia.news.filter(
            (item) =>
                /\b(stocks?|shares?|invest(?:ment|or|ing|ors|ments)?|rupiah|banks?|rates?|MSCI|Telkom|Freeport|tariffs?|economy|equities)\b/i.test(
                    item.title,
                ) &&
                !/market size|market to reach|market share|forecast|mordor|industry trends/i.test(
                    item.title,
                ),
        );
        const unique = new Map([...market.news, ...relevant].map((item) => [item.uuid, item]));
        return [...unique.values()]
            .sort((a, b) => b.providerPublishTime.getTime() - a.providerPublishTime.getTime())
            .slice(0, count);
    });
}
