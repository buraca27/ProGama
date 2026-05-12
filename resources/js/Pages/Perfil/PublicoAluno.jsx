import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

function BadgeChip({ badge }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{badge.nome}</p>
            <p className="text-xs text-slate-500">{badge.raridade ?? "comum"}</p>
        </div>
    );
}

export default function PublicoAluno({ usuario, xpTotal, nivelAtual, percentagemNivel, xpProxNivel, badges, contagemBadges, social }) {
    const seguir = () => router.post(route("social.seguir", usuario.id));
    const deixarSeguir = () => router.delete(route("social.deixar-seguir", usuario.id));

    return (
        <AuthenticatedLayout>
            <Head title={`Perfil Publico - ${usuario?.name ?? "Aluno"}`} />

            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{usuario?.name}</h1>
                            <p className="text-sm text-slate-500">Nivel {nivelAtual} • {xpTotal} XP</p>
                        </div>

                        {!social?.is_self && (
                            <div className="flex items-center gap-2">
                                {social?.is_following ? (
                                    <button onClick={deixarSeguir} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 dark:border-slate-600 dark:text-slate-100">
                                        Deixar de seguir
                                    </button>
                                ) : (
                                    <button onClick={seguir} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                                        Seguir
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-4">
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                            <p className="text-xs text-slate-500">Progresso</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{Number(percentagemNivel || 0).toFixed(1)}%</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                            <p className="text-xs text-slate-500">XP Proximo Nivel</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{xpProxNivel}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                            <p className="text-xs text-slate-500">Seguidores</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{social?.seguidores ?? 0}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                            <p className="text-xs text-slate-500">Seguindo</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{social?.seguindo ?? 0}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Badges ({contagemBadges})</h2>
                        <Link href={route("gamificacao.leaderboard")} className="text-sm font-semibold text-blue-600 hover:underline">
                            Ver Leaderboard
                        </Link>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {(badges?.data ?? []).map((badge) => (
                            <BadgeChip key={badge.id} badge={badge} />
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
