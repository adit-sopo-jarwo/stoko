import { yahooFinance, respond, ticker, type StockContext } from "@/lib/yahoo-finance";

export async function GET(request: Request, context: StockContext) {
    return respond(async () => {
        return yahooFinance.quoteSummary(await ticker(request, context), {
            modules: [
                "summaryDetail",
                "defaultKeyStatistics",
                "financialData",
                "calendarEvents",
                "majorHoldersBreakdown",
                "institutionOwnership",
            ],
        });
    });
}
