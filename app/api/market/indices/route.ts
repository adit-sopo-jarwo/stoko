import { yahooFinance, respond } from "@/lib/yahoo-finance";
import { INDEX_SYMBOLS } from "@/lib/stock-symbols";
export async function GET() {
    return respond(async () => {
        return yahooFinance.quote(INDEX_SYMBOLS);
    });
}
