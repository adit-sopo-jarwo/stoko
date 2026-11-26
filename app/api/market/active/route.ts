import { respond } from "@/lib/yahoo-finance";
import { ranked } from "@/lib/market-data";
export async function GET(request: Request) {
    return respond(async () => {
        return ranked(request, "active");
    });
}
