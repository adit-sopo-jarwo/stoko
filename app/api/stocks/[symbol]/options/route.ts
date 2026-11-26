import {
    yahooFinance,
    respond,
    query,
    ticker,
    dateParam,
    type StockContext,
} from "@/lib/yahoo-finance";

export async function GET(request: Request, context: StockContext) {
    return respond(async () => {
        const q = query(request);
        const date = q.get("date");
        return yahooFinance.options(
            await ticker(request, context),
            date ? { date: dateParam(date, new Date()) } : {},
        );
    });
}
