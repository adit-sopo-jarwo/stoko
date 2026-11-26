import { SiteHeader } from "@/components/site-header";
import { MarketTicker } from "@/components/market-ticker";
import { NewsSection } from "@/components/news-section";

export default function Home() {
    return (
        <>
            <SiteHeader />
            <MarketTicker />
            <NewsSection />
        </>
    );
}
