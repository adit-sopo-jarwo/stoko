import { respond } from "@/lib/yahoo-finance";
import { screen } from "@/lib/market-data";
export async function GET(request: Request) {
    return respond(async () => {
        return screen(request);
    });
}
