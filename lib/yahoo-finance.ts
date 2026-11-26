import YahooFinance from "yahoo-finance2";
import { NextResponse } from "next/server";
export const yahooFinance = new YahooFinance();
export class BadRequest extends Error {}
export function normalizeSymbol(input: string, market = "ID") {
    const s = input.trim().toUpperCase();
    if (!/^[A-Z0-9^][A-Z0-9.^=\-]{0,29}$/.test(s)) throw new BadRequest("Invalid symbol");
    return market === "ID" && /^[A-Z]{4}$/.test(s) ? `${s}.JK` : s;
}
export function query(request: Request) {
    return new URL(request.url).searchParams;
}
export type StockContext = { params: Promise<{ symbol: string }> };
export async function ticker(request: Request, context: StockContext) {
    return normalizeSymbol((await context.params).symbol, query(request).get("market") ?? "ID");
}
export async function respond(fn: () => Promise<unknown>) {
    try {
        return NextResponse.json(await fn());
    } catch (error) {
        if (error instanceof BadRequest)
            return NextResponse.json({ error: error.message }, { status: 400 });
        console.error("Yahoo Finance:", error);
        return NextResponse.json(
            { error: "Market data unavailable from provider" },
            { status: 502 },
        );
    }
}
export function limit(q: URLSearchParams, fallback = 20, max = 100) {
    const n = Number(q.get("limit") ?? fallback);
    if (!Number.isInteger(n) || n < 1 || n > max) throw new BadRequest(`limit must be 1-${max}`);
    return n;
}
export function dateParam(value: string | null, fallback: Date) {
    if (!value) return fallback;
    const d = new Date(value);
    if (!Number.isFinite(d.getTime())) throw new BadRequest("Invalid date");
    return d;
}
