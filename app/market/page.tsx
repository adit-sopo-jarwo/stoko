import { SiteHeader } from "@/components/site-header";
import { MarketTicker } from "@/components/market-ticker";
import { MarketDashboard } from "@/components/market-dashboard";

export default function MarketPage() {
    return (
        <>
            <SiteHeader />
            <MarketTicker />
            <MarketDashboard />
        </>
    );
}
