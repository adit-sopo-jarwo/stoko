import type { Metadata } from "next";
import { Geist, Geist_Mono, Raleway } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getSiteUrl, siteDescription, siteName } from "@/lib/seo";

const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: getSiteUrl(),
    title: {
        default: "Stoko | Pantau Saham dan Berita Pasar",
        template: `%s | ${siteName}`,
    },
    description: siteDescription,
    applicationName: siteName,
    alternates: getSiteUrl() ? { canonical: getSiteUrl()?.toString() } : undefined,
    openGraph: {
        title: "Stoko | Pantau Saham dan Berita Pasar",
        description: siteDescription,
        siteName,
        locale: "id_ID",
        type: "website",
        url: getSiteUrl()?.toString(),
    },
    twitter: {
        card: "summary_large_image",
        title: "Stoko | Pantau Saham dan Berita Pasar",
        description: siteDescription,
    },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="id"
            className={cn(
                "h-full",
                "antialiased",
                geistSans.variable,
                geistMono.variable,
                "font-sans",
                raleway.variable,
            )}
        >
            <body className="min-h-full flex flex-col">{children}</body>
        </html>
    );
}
