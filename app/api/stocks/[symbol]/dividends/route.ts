import {
    yahooFinance,
    respond,
    query,
    ticker,
    BadRequest,
    dateParam,
    type StockContext,
} from "@/lib/yahoo-finance";

export async function GET(request: Request, context: StockContext) {
    return respond(async () => {
        const q = query(request);
        const period2 = dateParam(q.get("to"), new Date());
        const period1 = dateParam(q.get("from"), new Date(period2.getTime() - 5 * 365 * 86400000));
        if (period1 >= period2) throw new BadRequest("from must be before to");
        const result = await yahooFinance.chart(await ticker(request, context), {
            period1,
            period2,
            interval: "1mo",
            events: "div|split",
        });
        return {
            dividends: result.events?.dividends ?? [],
            splits: result.events?.splits ?? [],
        };
    });
}
