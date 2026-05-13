import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

const card =
    "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800";

function UserRow({ item, extra }) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 dark:border-slate-700">
            <div className="flex items-center gap-3">
                <span className="w-7 text-center font-bold text-slate-500">
                    #{item.posicao}
                </span>
                <div>
                    <Link
                        href={route("perfil.publico", item.usuario?.id)}
                        className="font-semibold text-slate-800 hover:underline dark:text-slate-100"
                    >
                        {item.usuario?.name ?? "Utilizador"}
                    </Link>
                    <p className="text-xs text-slate-500">
                        Nível {item.nivel ?? "-"}
                    </p>
                </div>
            </div>
            <div className="text-right">{extra}</div>
        </div>
    );
}

export default function Leaderboard({
    podio = [],
    ranking_xp = [],
    ranking_nivel = [],
    ranking_badges = [],
}) {
    const podioOrdenado = [...podio].sort((a, b) => a.posicao - b.posicao);

    return (
        <AuthenticatedLayout>
            <Head title="Ranking" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            Ranking
                        </h1>
                        <p className="text-sm text-slate-500">
                            Top por XP, Nível e pontuação de distintivos.
                        </p>
                    </div>
                    <Link
                        href={route("social.hub")}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
                    >
                        Ver Rede Social
                    </Link>
                </div>

                <section className={card}>
                    <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
                        Pódio XP
                    </h2>
                    <div className="grid gap-3 md:grid-cols-3">
                        {podioOrdenado.map((u) => (
                            <div
                                key={u.posicao}
                                className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 p-4 dark:from-slate-700 dark:to-slate-800"
                            >
                                <p className="text-xs font-semibold uppercase text-slate-500">
                                    Lugar {u.posicao}
                                </p>
                                <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                                    {u.usuario?.name}
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                    Nível {u.nivel} • {u.xp_total} XP
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-3">
                    <section className={card}>
                        <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">
                            Ranking por XP
                        </h3>
                        <div className="space-y-2">
                            {ranking_xp.map((item) => (
                                <UserRow
                                    key={`xp-${item.posicao}-${item.usuario?.id}`}
                                    item={item}
                                    extra={
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                            {item.xp_total} XP
                                        </p>
                                    }
                                />
                            ))}
                        </div>
                    </section>

                    <section className={card}>
                        <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">
                            Ranking por Nível
                        </h3>
                        <div className="space-y-2">
                            {ranking_nivel.map((item) => (
                                <UserRow
                                    key={`nivel-${item.posicao}-${item.usuario?.id}`}
                                    item={item}
                                    extra={
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                            N{item.nivel}
                                        </p>
                                    }
                                />
                            ))}
                        </div>
                    </section>

                    <section className={card}>
                        <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">
                            Ranking de Distintivos (Peso)
                        </h3>
                        <p className="mb-3 text-xs text-slate-500">
                            Ouro=10 • Prata=5 • Bronze=3 • Outros=1
                        </p>
                        <div className="space-y-2">
                            {ranking_badges.map((item) => (
                                <UserRow
                                    key={`badge-${item.posicao}-${item.usuario?.id}`}
                                    item={{ ...item, nivel: "-" }}
                                    extra={
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                {item.badge_score} pontos
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {item.total_badges} distintivos
                                            </p>
                                        </div>
                                    }
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
