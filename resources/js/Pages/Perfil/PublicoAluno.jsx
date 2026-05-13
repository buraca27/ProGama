import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

function BadgeChip({ badge }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {badge.nome}
            </p>
            <p className="text-xs text-slate-500">
                {badge.raridade ?? "comum"}
            </p>
        </div>
    );
}

export default function PublicoAluno({
    usuario,
    xpTotal,
    nivelAtual,
    percentagemNivel,
    xpProxNivel,
    badges,
    contagemBadges,
    social,
}) {
    const seguir = () => router.post(route("social.seguir", usuario.id));
    const deixarSeguir = () =>
        router.delete(route("social.deixar-seguir", usuario.id));
    const recusarPedido = () =>
        router.post(route("social.recusar", usuario.id));

    return (
        <AuthenticatedLayout>
            <Head title={`Perfil Público - ${usuario?.name ?? "Aluno"}`} />

            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                                {usuario?.name}
                            </h1>
                            <p className="text-sm text-slate-500">
                                Nível {nivelAtual} • {xpTotal} XP
                            </p>
                        </div>

                        {!social?.is_self && (
                            <div className="flex flex-wrap items-center gap-2">
                                {social?.is_connected ? (
                                    <button
                                        onClick={deixarSeguir}
                                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                                    >
                                        Desconectar
                                    </button>
                                ) : social?.request_received ? (
                                    <>
                                        <button
                                            onClick={seguir}
                                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                                        >
                                            Aceitar pedido
                                        </button>
                                        <button
                                            onClick={recusarPedido}
                                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 dark:border-slate-600 dark:text-slate-100"
                                        >
                                            Recusar pedido
                                        </button>
                                    </>
                                ) : social?.request_sent ? (
                                    <button
                                        className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                                        disabled
                                    >
                                        Pedido enviado
                                    </button>
                                ) : (
                                    <button
                                        onClick={seguir}
                                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                                    >
                                        Enviar pedido
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-4">
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                            <p className="text-xs text-slate-500">Progresso</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {Number(percentagemNivel || 0).toFixed(1)}%
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                            <p className="text-xs text-slate-500">
                                XP Próximo Nível
                            </p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {xpProxNivel}
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                            <p className="text-xs text-slate-500">Seguidores</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {social?.seguidores ?? 0}
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                            <p className="text-xs text-slate-500">Seguindo</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {social?.seguindo ?? 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Distintivos ({contagemBadges})
                        </h2>
                        <Link
                            href={route("dashboard", { view: "leaderboard" })}
                            className="text-sm font-semibold text-blue-600 hover:underline"
                        >
                            Ver Ranking
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
