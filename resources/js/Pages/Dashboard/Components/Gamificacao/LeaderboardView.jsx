
const card =
    "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800";

function UserRow({ item, extra, onOpenPerfil, highlight = false, isMine = false }) {
    const baseClass =
        "flex items-center justify-between rounded-xl border px-3 py-2";
    const normalClass = "border-slate-100 dark:border-slate-700";
    const highlightClass =
        "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20 border-l-4 border-l-blue-500";
    const mineClass =
        "border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20";

    const className = isMine
        ? `${baseClass} ${mineClass}`
        : highlight
        ? `${baseClass} ${highlightClass}`
        : `${baseClass} ${normalClass}`;

    return (
        <div className={className}>
            <div className="flex items-center gap-3">
                <span className="w-7 text-center font-bold text-slate-500">#{item.posicao}</span>
                <div>
                    {item.usuario ? (
                        <button
                            onClick={() => onOpenPerfil?.(item.usuario?.id)}
                            className="font-semibold text-slate-800 hover:underline dark:text-slate-100 text-left"
                        >
                            {item.usuario?.name ?? "Utilizador"}
                        </button>
                    ) : (
                        <p className="font-semibold text-blue-700 dark:text-blue-300">
                            {isMine ? "Tu" : "Utilizador"}
                        </p>
                    )}
                    <p className="text-xs text-slate-500">Nivel {item.nivel ?? "-"}</p>
                </div>
            </div>
            <div className="text-right">{extra}</div>
        </div>
    );
}

function Separator() {
    return (
        <div className="my-2 flex items-center gap-2">
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
            <span className="text-xs text-slate-400">...</span>
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
        </div>
    );
}

export default function LeaderboardView({
    podio = [],
    ranking_xp = [],
    ranking_nivel = [],
    ranking_badges = [],
    onViewChange,
    onOpenPerfil,
    authUserId = null,
    minhaPosicao = null,
}) {
    const podioOrdenado = [...podio].sort((a, b) => a.posicao - b.posicao);

    const inTopXp     = ranking_xp.some((item) => item.usuario?.id === authUserId);
    const inTopNivel  = ranking_nivel.some((item) => item.usuario?.id === authUserId);
    const inTopBadges = ranking_badges.some((item) => item.usuario?.id === authUserId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Leaderboard</h1>
                    <p className="text-sm text-slate-500">Top por XP, Nivel e Pontuacao de Badges.</p>
                </div>
                <button
                    onClick={() => onViewChange?.("social")}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
                >
                    Ver Rede Social
                </button>
            </div>

            <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Pódio XP</h2>
                <div className="flex h-64 items-end justify-center gap-2 sm:gap-6 mt-12 pb-4">
                    {[
                        { pos: 2, height: "h-32", color: "from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700" },
                        { pos: 1, height: "h-48", color: "from-yellow-300 to-amber-500 dark:from-yellow-600 dark:to-amber-700" },
                        { pos: 3, height: "h-24", color: "from-orange-300 to-orange-400 dark:from-orange-700 dark:to-orange-800" },
                    ].map((config) => {
                        const u = podio.find((p) => p.posicao === config.pos);
                        if (!u) return null;
                        
                        const isMe = u.usuario?.id === authUserId;

                        return (
                            <div key={config.pos} className="flex flex-col items-center w-1/3 max-w-[140px] group relative">
                                {/* Badge Icon for 1st Place */}
                                {config.pos === 1 && (
                                    <div className="absolute -top-10 z-20 text-3xl drop-shadow-lg animate-bounce">
                                        👑
                                    </div>
                                )}
                                
                                {/* Avatar & Info */}
                                <div className="mb-3 flex flex-col items-center text-center relative z-10">
                                    <button 
                                        onClick={() => onOpenPerfil?.(u.usuario?.id)}
                                        className={`relative z-10 flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-full border-4 shadow-md transition-transform group-hover:scale-105 ${isMe ? "border-blue-500 dark:border-blue-500" : "border-white dark:border-slate-800"} bg-slate-100 dark:bg-slate-700`}
                                    >
                                        {u.usuario?.foto_perfil ? (
                                            <img src={u.usuario.foto_perfil} alt={u.usuario.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-xl sm:text-2xl font-bold text-slate-500 dark:text-slate-300">
                                                {u.usuario?.name?.charAt(0) ?? "?"}
                                            </span>
                                        )}
                                    </button>
                                    <div className="mt-2 max-w-[100px] sm:max-w-[140px]">
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                            {u.usuario?.name?.split(' ')[0]}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            {u.xp_total} XP
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Bar */}
                                <div className={`w-full rounded-t-xl bg-gradient-to-t ${config.color} ${config.height} flex flex-col items-center justify-start pt-2 sm:pt-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] relative overflow-hidden transition-all duration-300 group-hover:brightness-110`}>
                                    <span className="text-4xl sm:text-6xl font-black text-white/50 drop-shadow-sm">
                                        {config.pos}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Ranking XP */}
                <section className={card}>
                    <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">Ranking por XP</h3>
                    <div className="space-y-2">
                        {ranking_xp.map((item) => (
                            <UserRow
                                key={`xp-${item.posicao}-${item.usuario?.id}`}
                                item={item}
                                extra={<p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.xp_total} XP</p>}
                                onOpenPerfil={onOpenPerfil}
                                highlight={item.usuario?.id === authUserId}
                            />
                        ))}
                        {!inTopXp && minhaPosicao && (
                            <>
                                <Separator />
                                <UserRow
                                    item={{ posicao: minhaPosicao.xp, usuario: null, nivel: minhaPosicao.nivel_atual }}
                                    extra={<p className="text-sm font-bold text-blue-700 dark:text-blue-300">{minhaPosicao.xp_total} XP</p>}
                                    onOpenPerfil={onOpenPerfil}
                                    isMine
                                />
                            </>
                        )}
                    </div>
                </section>

                {/* Ranking Nivel */}
                <section className={card}>
                    <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">Ranking por Nivel</h3>
                    <div className="space-y-2">
                        {ranking_nivel.map((item) => (
                            <UserRow
                                key={`nivel-${item.posicao}-${item.usuario?.id}`}
                                item={item}
                                extra={<p className="text-sm font-bold text-slate-800 dark:text-slate-100">N{item.nivel}</p>}
                                onOpenPerfil={onOpenPerfil}
                                highlight={item.usuario?.id === authUserId}
                            />
                        ))}
                        {!inTopNivel && minhaPosicao && (
                            <>
                                <Separator />
                                <UserRow
                                    item={{ posicao: minhaPosicao.nivel, usuario: null, nivel: minhaPosicao.nivel_atual }}
                                    extra={<p className="text-sm font-bold text-blue-700 dark:text-blue-300">N{minhaPosicao.nivel_atual}</p>}
                                    onOpenPerfil={onOpenPerfil}
                                    isMine
                                />
                            </>
                        )}
                    </div>
                </section>

                {/* Ranking Badges */}
                <section className={card}>
                    <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">Ranking Badges (Peso)</h3>
                    <p className="mb-3 text-xs text-slate-500">Ouro=10 • Silver=5 • Bronze=3 • Outros=1</p>
                    <div className="space-y-2">
                        {ranking_badges.map((item) => (
                            <UserRow
                                key={`badge-${item.posicao}-${item.usuario?.id}`}
                                item={{ ...item, nivel: item.nivel ?? "-" }}
                                extra={
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.badge_score} pts</p>
                                        <p className="text-xs text-slate-500">{item.total_badges} badges</p>
                                    </div>
                                }
                                onOpenPerfil={onOpenPerfil}
                                highlight={item.usuario?.id === authUserId}
                            />
                        ))}
                        {!inTopBadges && minhaPosicao && (
                            <>
                                <Separator />
                                <UserRow
                                    item={{ posicao: minhaPosicao.badges, usuario: null, nivel: "-" }}
                                    extra={
                                        <div>
                                            <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{minhaPosicao.badge_score} pts</p>
                                            <p className="text-xs text-slate-500">{minhaPosicao.total_badges} badges</p>
                                        </div>
                                    }
                                    onOpenPerfil={onOpenPerfil}
                                    isMine
                                />
                            </>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
