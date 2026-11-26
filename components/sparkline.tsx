export function Sparkline({
    points,
    positive,
    neutral = false,
}: {
    points: number[];
    positive: boolean;
    neutral?: boolean;
}) {
    if (points.length < 2) return <span className="block h-7 w-14 shrink-0" aria-hidden="true" />;

    const width = 56;
    const height = 28;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const spread = max - min || 1;
    const path = points
        .map((value, index) => {
            const x = (index / (points.length - 1)) * width;
            const y = height - 2 - ((value - min) / spread) * (height - 4);
            return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ");

    return (
        <svg viewBox="0 0 56 28" className="h-7 w-14 shrink-0" aria-hidden="true">
            <path
                d={path}
                fill="none"
                stroke={neutral ? "#9ca3af" : positive ? "#00ad7c" : "#e43d48"}
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </svg>
    );
}
