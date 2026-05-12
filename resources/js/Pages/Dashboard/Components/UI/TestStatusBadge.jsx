export default function TestStatusBadge({ status, tone = "slate" }) {
    const classes = {
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        emerald:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    };

    return (
        <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${classes[tone] || classes.slate}`}
        >
            {status}
        </span>
    );
}
