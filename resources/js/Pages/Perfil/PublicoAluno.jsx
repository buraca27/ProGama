import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { BadgeChip, MedalStat } from "@/Pages/Dashboard/Components/Social/BadgeDetailPopup";


function SocialButtons({ social, onSeguir, onDeixarSeguir, onRecusar }) {
    if (social?.is_self) return null;
    if (social?.is_connected) {
        return (
            <button onClick={onDeixarSeguir} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm dark:bg-slate-100 dark:text-slate-900">
                Desconectar
            </button>
        );
    }
    if (social?.request_received) {
        return (
            <>
                <button onClick={onSeguir} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
                    Aceitar pedido
                </button>
                <button onClick={onRecusar} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 dark:border-slate-600 dark:text-slate-100">
                    Recusar pedido
                </button>
            </>
        );
    }
    if (social?.request_sent) {
        return (
            <button disabled className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                Pedido enviado
            </button>
        );
    }
    return (
        <button onClick={onSeguir} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm dark:bg-slate-100 dark:text-slate-900">
            Enviar pedido
        </button>
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
    const seguir       = () => router.post(route("social.seguir", usuario.id));
    const deixarSeguir = () => router.delete(route("social.deixar-seguir", usuario.id));
    const recusar      = () => router.post(route("social.recusar", usuario.id));

    const badgesList   = Array.isArray(badges) ? badges : (badges?.data ?? []);
    const badgesOuro   = badgesList.filter(b => parseInt(b.raridade) === 3 || parseInt(b.raridade) === 4).length;
    const badgesPrata  = badgesList.filter(b => parseInt(b.raridade) === 2).length;
    const badgesBronze = badgesList.filter(b => parseInt(b.raridade) === 1).length;

    return (
        <AuthenticatedLayout>
            <Head title={`Perfil Público - ${usuario?.name ?? "Aluno"}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Card identidade */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                {usuario?.foto_perfil ? (
                                    <img src={usuario.foto_perfil} alt={usuario.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-slate-600 dark:text-slate-200">
                                        {usuario?.name?.charAt(0) ?? "U"}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Perfil do Aluno</p>
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white">{usuario?.name}</h1>
                                <p className="text-sm text-slate-500">Nível {nivelAtual} • {xpTotal} XP</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:shrink-0">
                            <SocialButtons
                                social={social}
                                onSeguir={seguir}
                                onDeixarSeguir={deixarSeguir}
                                onRecusar={recusar}
                            />
                        </div>
                    </div>

                    {/* Stats grid */}
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">XP Total</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{xpTotal}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Nível Atual</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{nivelAtual}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                Badges Conquistadas ({contagemBadges})
                            </p>
                            <div className="mt-2 flex items-center justify-around">
                                <MedalStat type="ouro"   count={badgesOuro} />
                                <MedalStat type="prata"  count={badgesPrata} />
                                <MedalStat type="bronze" count={badgesBronze} />
                            </div>
                        </div>
                    </div>

                    {/* Seguidores */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Seguidores</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{social?.seguidores ?? 0}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Seguindo</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{social?.seguindo ?? 0}</p>
                        </div>
                    </div>

                    {/* Barra de progresso */}
                    <div className="mt-4 rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Progresso para o próximo nível
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {Number(percentagemNivel || 0).toFixed(1)}% concluído ({xpTotal}/{xpProxNivel} XP)
                                </p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Nível {(nivelAtual ?? 1) + 1}
                            </span>
                        </div>
                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                                style={{ width: `${Math.min(Math.max(Number(percentagemNivel) || 0, 0), 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Distintivos */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
                        Distintivos ({contagemBadges})
                    </h2>

                    {badgesList.length === 0 ? (
                        <p className="text-sm text-slate-500">Ainda sem distintivos.</p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {badgesList.map((badge) => (
                                <BadgeChip key={badge.id} badge={badge} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
