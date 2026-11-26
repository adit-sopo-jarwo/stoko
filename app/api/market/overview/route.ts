import { io } from "next/cache";
import { marketOverview } from "@/lib/market-data";

export async function GET() {
    await io();
    try {
        return Response.json(await marketOverview(5), {
            headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
        });
    } catch (error) {
        console.error("Market overview unavailable:", error);
        return Response.json({ error: "Market overview unavailable" }, { status: 502 });
    }
}
