import {
    yahooFinance,
    respond,
    query,
    normalizeSymbol,
    BadRequest,
    limit,
} from "@/lib/yahoo-finance";
import { IDX_LIST_SYMBOLS } from "@/lib/stock-symbols";
export async function GET(request: Request) {
    return respond(async () => {
        const q = query(request);
        const symbols = q.get("symbols");
        const pageSize = limit(q, 20, 50);
        const page = Number(q.get("page") ?? 1);
        if (!Number.isSafeInteger(page) || page < 1)
            throw new BadRequest("page must be a positive integer");
        const list = symbols
            ? [
                  ...new Set(
                      symbols.split(",").map((s) => normalizeSymbol(s, q.get("market") ?? "ID")),
                  ),
              ]
            : IDX_LIST_SYMBOLS.slice((page - 1) * pageSize, page * pageSize);
        if (list.length > 50) throw new BadRequest("Maximum 50 symbols");
        return yahooFinance.quote(list);
    });
}
