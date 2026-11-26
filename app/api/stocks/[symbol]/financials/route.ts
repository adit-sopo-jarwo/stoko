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
        const type = q.get("type") ?? "annual";
        const financialModule = q.get("module") ?? "all";
        if (
            !["annual", "quarterly", "trailing"].includes(type) ||
            !["all", "financials", "balance-sheet", "cash-flow"].includes(financialModule)
        )
            throw new BadRequest("Invalid type or module");
        const period2 = dateParam(q.get("to"), new Date());
        const period1 = dateParam(q.get("from"), new Date(period2.getTime() - 5 * 365 * 86400000));
        if (period1 >= period2) throw new BadRequest("from must be before to");
        return yahooFinance.fundamentalsTimeSeries(await ticker(request, context), {
            period1,
            period2,
            type,
            module: financialModule,
        });
    });
}
