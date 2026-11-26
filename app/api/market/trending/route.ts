import { yahooFinance, respond, query, BadRequest, limit } from "@/lib/yahoo-finance";
import { marketOverview } from "@/lib/market-data";

export async function GET(request: Request) {
    return respond(async () => {
        const q = query(request);
        const region = (q.get("region") ?? "ID").toUpperCase();
        if (!/^[A-Z]{2}$/.test(region)) throw new BadRequest("Invalid region");
        if (region === "ID") {
            const { universe, universeSize, trendingBasis, trending } = await marketOverview(
                limit(q),
            );
            return { universe, universeSize, basis: trendingBasis, data: trending };
        }
        return yahooFinance.trendingSymbols(region, {
            count: limit(q),
        });
    });
}
