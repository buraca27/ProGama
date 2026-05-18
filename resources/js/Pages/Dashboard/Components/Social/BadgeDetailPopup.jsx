import { useState } from "react";

const RARIDADE_STYLE = {
    1: { label: "Bronze",   bg: "bg-orange-50 dark:bg-orange-900/30",   text: "text-orange-700 dark:text-orange-300",   dot: "bg-orange-400",  symbol: "🥉" },
    2: { label: "Prata",    bg: "bg-slate-100 dark:bg-slate-700/60",    text: "text-slate-600 dark:text-slate-300",    dot: "bg-slate-400",   symbol: "🥈" },
    3: { label: "Ouro",     bg: "bg-amber-50 dark:bg-amber-900/30",     text: "text-amber-700 dark:text-amber-300",    dot: "bg-amber-500",   symbol: "🥇" },
    4: { label: "Lendária", bg: "bg-purple-50 dark:bg-purple-900/30",   text: "text-purple-700 dark:text-purple-300",  dot: "bg-purple-500",  symbol: "👑" },
};

function getRaridade(r) {
    return RARIDADE_STYLE[parseInt(r)] ?? RARIDADE_STYLE[1];
}

function BadgeDetail({ badge, onClose }) {
    const r = getRaridade(badge.raridade);
    const dataObtida = badge.pivot?.data_obtencao
        ? new Date(badge.pivot.data_obtencao).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })
        : null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
                className="relative z-10 w-full max-w-sm rounded-3xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Topo colorido */}
                <div className={`flex flex-col items-center gap-3 py-8 px-6 ${r.bg}`}>
                    {badge.icone_url ? (
                        <img src={`/storage/${badge.icone_url}`} alt={badge.nome} className="h-24 w-24 object-contain drop-shadow-md" />
                    ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/60 dark:bg-slate-900/40 text-5xl drop-shadow-md">
                            🏅
                        </div>
                    )}
                    <span className={`inline-flex items-center gap-1.5 rounded-full border border-current/10 px-3 py-1 text-xs font-bold uppercase tracking-widest ${r.text} ${r.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${r.dot}`} />
                        {r.label}
                    </span>
                </div>

                {/* Corpo */}
                <div className="p-6 space-y-3 text-center">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {badge.nome}
                    </h3>

                    {badge.descricao && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {badge.descricao}
                        </p>
                    )}

                    {dataObtida && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            Conquistada em {dataObtida}
                        </p>
                    )}

                    <button
                        onClick={onClose}
                        className="mt-2 w-full rounded-2xl bg-slate-900 py-2.5 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

export function BadgeChip({ badge }) {
    const [open, setOpen] = useState(false);
    const r = getRaridade(badge.raridade);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center transition hover:border-slate-300 hover:shadow-sm active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 w-full"
            >
                {badge.icone_url ? (
                    <img src={`/storage/${badge.icone_url}`} alt={badge.nome} className="mb-2 h-14 w-14 object-contain" />
                ) : (
                    <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-2xl dark:bg-slate-700">
                        {r.symbol}
                    </div>
                )}
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">{badge.nome}</p>
                <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${r.bg} ${r.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${r.dot}`} />
                    {r.label}
                </span>
            </button>

            {open && <BadgeDetail badge={badge} onClose={() => setOpen(false)} />}
        </>
    );
}

export function MedalStat({ type, count }) {
    const map = {
        lendaria: { bg: "bg-purple-100 dark:bg-purple-900/40", symbol: "💎", label: "Lendária" },
        ouro:     { bg: "bg-amber-100 dark:bg-amber-900/40",   symbol: "🥇", label: "Ouro" },
        prata:    { bg: "bg-slate-100 dark:bg-slate-700",      symbol: "🥈", label: "Prata" },
        bronze:   { bg: "bg-orange-100 dark:bg-orange-900/40", symbol: "🥉", label: "Bronze" },
    };
    const s = map[type];
    return (
        <div className="flex flex-col items-center gap-1">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${s.bg} text-lg`}>
                {s.symbol}
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-white">{count}</span>
            <span className="text-[9px] uppercase tracking-widest text-slate-500">{s.label}</span>
        </div>
    );
}
