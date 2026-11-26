import { yahooFinance, respond, ticker, type StockContext } from "@/lib/yahoo-finance";

export async function GET(request: Request, context: StockContext) {
    return respond(async () => {
        const symbol = await ticker(request, context);
        return yahooFinance.recommendationsBySymbol(symbol);
    });
}
