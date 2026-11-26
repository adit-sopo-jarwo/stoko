import { yahooFinance, respond, ticker, type StockContext } from "@/lib/yahoo-finance";

export async function GET(request: Request, context: StockContext) {
    return respond(async () => {
        return yahooFinance.insights(await ticker(request, context));
    });
}
