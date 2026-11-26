import { ImageResponse } from "next/og";

export const alt = "Stoko — pantau saham dan berita pasar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
    return new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "76px 88px",
                background: "#0f172a",
                color: "#f8fafc",
                fontFamily: "sans-serif",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <svg width="70" height="70" viewBox="0 0 64 64">
                    <rect width="64" height="64" rx="14" fill="#1e293b" />
                    <path
                        d="M43 18c-6-5-16-5-21 0l-5 5c-4 6 1 11 11 11h8c9 0 13 5 9 12-5 8-18 8-25 2"
                        fill="none"
                        stroke="#5eead4"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span style={{ fontSize: 46, fontWeight: 700 }}>stoko</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        fontSize: 76,
                        fontWeight: 700,
                        lineHeight: 1.1,
                    }}
                >
                    <span>Pantau saham.</span>
                    <span>Pahami pasar.</span>
                </div>
                <div style={{ fontSize: 30, color: "#94a3b8" }}>
                    Harga saham dan berita pasar dalam satu tempat.
                </div>
            </div>
            <div style={{ width: 96, height: 8, borderRadius: 4, background: "#5eead4" }} />
        </div>,
        size,
    );
}
