import { router } from "@inertiajs/react";
import { BadgeChip, MedalStat } from "./BadgeDetailPopup";

function SocialButtons({ social, onSeguir, onDeixarSeguir, onRecusar }) {
    if (social?.is_self) return null;
    if (social?.is_connected) {
        return (
            <button onClick={onDeixarSeguir} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                Desconectar
            </button>
        );
    }
    if (social?.request_received) {
        return (
            <>
                <button onClick={onSeguir} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
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
        <button onClick={onSeguir} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
            Enviar pedido
        </button>
    );
}

export default function PerfilPublicoModal({ dados, loading, onClose }) {
    const {
        usuario, isAluno, xpTotal, nivelAtual, percentagemNivel, xpProxNivel,
        badges = [], contagemBadges, social,
    } = dados ?? {};

    const seguir       = () => router.post(route("social.seguir", usuario.id));
    const deixarSeguir = () => router.delete(route("social.deixar-seguir", usuario.id));
    const recusar      = () => router.post(route("social.recusar", usuario.id));

    const badgesList   = Array.isArray(badges) ? badges : (badges?.data ?? []);
    const badgesOuro   = badgesList.filter(b => parseInt(b.raridade) === 3 || parseInt(b.raridade) === 4).length;
    const badgesPrata  = badgesList.filter(b => parseInt(b.raridade) === 2).length;
    const badgesBronze = badgesList.filter(b => parseInt(b.raridade) === 1).length;
    const pct          = Math.min(Math.max(Number(percentagemNivel) || 0, 0), 100);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative z-10 w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-gray-50 dark:bg-gray-900 shadow-2xl">
                {/* Cabeçalho */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-5 py-4">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Perfil Público</h2>
                    <button
                        onClick={onClose}
                        className="rounded-xl p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Fechar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : !dados ? null : (
                    <div className="p-4 space-y-4">
                        {/* Identidade */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                            {/* Nome + botões */}
                            <div className="flex items-start gap-3">
                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                    {usuario.foto_perfil ? (
                                        <img src={usuario.foto_perfil} alt={usuario.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-slate-600 dark:text-slate-200">
                                            {usuario.name?.charAt(0) ?? "U"}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500">
                                        {usuario.id_role === 1 ? "Perfil da Secretaria" : usuario.id_role === 2 ? "Perfil do Professor" : "Perfil do Aluno"}
                                    </p>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">{usuario.name}</h3>
                                    {isAluno && (
                                        <p className="text-xs text-slate-500">Nível {nivelAtual} • {xpTotal} XP</p>
                                    )}
                                </div>
                            </div>

                            {!social?.is_self && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <SocialButtons
                                        social={social}
                                        onSeguir={seguir}
                                        onDeixarSeguir={deixarSeguir}
                                        onRecusar={recusar}
                                    />
                                </div>
                            )}

                            {/* Stats: XP + Nível — apenas alunos */}
                            {isAluno && (
                                <>
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500">XP Total</p>
                                            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{xpTotal}</p>
                                        </div>
                                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500">Nível Atual</p>
                                            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{nivelAtual}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">
                                            Badges Conquistadas ({contagemBadges})
                                        </p>
                                        <div className="flex items-center justify-around">
                                            <MedalStat type="ouro"   count={badgesOuro} />
                                            <MedalStat type="prata"  count={badgesPrata} />
                                            <MedalStat type="bronze" count={badgesBronze} />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Seguidores */}
                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Seguidores</p>
                                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{social?.seguidores ?? 0}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Seguindo</p>
                                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{social?.seguindo ?? 0}</p>
                                </div>
                            </div>

                            {/* Progresso — apenas alunos */}
                            {isAluno && (
                                <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-900 dark:text-white">Progresso para o próximo nível</p>
                                            <p className="text-[11px] text-slate-500">{xpTotal} / {xpProxNivel} XP · {pct.toFixed(1)}%</p>
                                        </div>
                                        <span className="shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            Nível {(nivelAtual ?? 1) + 1}
                                        </span>
                                    </div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Distintivos — apenas alunos */}
                        {isAluno && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                                <h4 className="mb-3 text-base font-bold text-slate-900 dark:text-white">
                                    Distintivos ({contagemBadges})
                                </h4>
                                {badgesList.length === 0 ? (
                                    <p className="text-sm text-slate-500">Ainda sem distintivos.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {badgesList.map((badge) => (
                                            <BadgeChip key={badge.id} badge={badge} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
