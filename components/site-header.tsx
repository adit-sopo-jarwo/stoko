"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { RiSearchLine } from "@remixicon/react";

const navItems = [
    { title: "Home", href: "/" },
    { title: "Market", href: "/market" },
    { title: "Stocks", href: "/stocks" },
    { title: "News", href: "/news" },
];

function NavLinks({ pathname = "" }: { pathname?: string }) {
    return (
        <ul className="flex items-center justify-center gap-1 sm:gap-2">
            {navItems.map(({ title, href }) => {
                const active =
                    href === "/"
                        ? pathname === "/"
                        : pathname === href ||
                          (href === "/stocks" && pathname.startsWith("/stocks/"));
                return (
                    <li key={title}>
                        <Link
                            href={href}
                            aria-current={active ? "page" : undefined}
                            className={`inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${active ? "bg-gray-900 text-white hover:bg-gray-800 hover:text-white" : "text-muted-foreground"}`}
                        >
                            {title}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

function ActiveNavLinks() {
    return <NavLinks pathname={usePathname()} />;
}

export function SiteHeader() {
    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-border bg-background/95 shadow-sm backdrop-blur-md">
                <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-8 lg:px-4">
                    <Link
                        href="/"
                        aria-label="MoneyMen home"
                        className="flex w-fit items-center gap-2.5 font-bold tracking-tight"
                    >
                        <span
                            aria-hidden="true"
                            className="flex size-9 items-center justify-center rounded-lg bg-primary text-lg text-primary-foreground"
                        >
                            M
                        </span>
                        <span className="text-lg">MoneyMen</span>
                    </Link>

                    <nav
                        aria-label="Main navigation"
                        className="col-span-2 row-start-2 justify-self-center lg:col-span-1 lg:col-start-2 lg:row-start-1"
                    >
                        <Suspense fallback={<NavLinks />}>
                            <ActiveNavLinks />
                        </Suspense>
                    </nav>

                    <form
                        action="/search"
                        method="get"
                        role="search"
                        className="relative col-start-2 row-start-1 w-full max-w-sm justify-self-end lg:col-start-3"
                    >
                        <RiSearchLine
                            aria-hidden="true"
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                            type="search"
                            name="q"
                            required
                            aria-label="Search stocks"
                            placeholder="Cari saham global..."
                            className="h-9 w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </form>
                </div>
            </header>
            <div aria-hidden="true" className="h-[109px] lg:h-[61px]" />
        </>
    );
}
