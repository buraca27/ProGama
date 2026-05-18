import React from "react";
import { usePage } from "@inertiajs/react";
import UpdateProfileInformationForm from "./UpdateProfileInformationForm";
import UpdatePasswordForm from "./UpdatePasswordForm";
import DeleteUserForm from "./DeleteUserForm";
import UpdateThemeForm from "./UpdateThemeForm";
import { MedalStat } from "@/Pages/Dashboard/Components/Social/BadgeDetailPopup";
import TwoFactorSettingsForm from "./TwoFactorSettingsForm";

export default function ProfileView({
    mustVerifyEmail,
    status,
    onOpenPerfil,
    onViewChange,
    showForms = true,
    showStats = true,
}) {
    const user = usePage().props.auth.user || {};
    const isAluno = (user.id_role ?? 3) === 3;
    const xpTotal = user.xp_total ?? 0;
    const nivelAtual = user.nivel_atual ?? 1;
    const percentagemNivel = Math.min(Math.max(user.percentagem_nivel ?? 0, 0), 100);
    const xpProximoNivel = user.xp_proximo_nivel ?? 0;
    const xpNivelAtual = user.xp_nivel_atual ?? 0;
    const xpNoNivel = Math.max(0, xpTotal - xpNivelAtual);
    const xpNecessarioNivel = Math.max(1, xpProximoNivel - xpNivelAtual);
    const badgesCount = user.badges_count ?? 0;
    const badgesOuro = user.badges_ouro_count ?? 0;
    const badgesPrata = user.badges_prata_count ?? 0;
    const badgesBronze = user.badges_bronze_count ?? 0;
    const seguidores = user.seguidores_count ?? 0;
    const seguindo = user.seguindo_count ?? 0;
    const conexoes = user.conexoes_count ?? 0;

    const roleLabel =
        user.id_role === 1
            ? "Secretaria"
            : user.id_role === 2
              ? "Professor"
              : "Aluno";

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {showStats && (
                <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                    <section className="space-y-6">
                        {/* Card principal do perfil */}
                        <div className="rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="flex gap-4 items-center">
                                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700 shrink-0">
                                        {user.foto_perfil ? (
                                            <img
                                                src={user.foto_perfil}
                                                alt={user.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl font-bold text-slate-600 dark:text-slate-200">
                                                {user.name?.charAt(0) ?? "U"}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                            Perfil do {roleLabel}
                                        </p>
                                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {user.name}
                                        </h1>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                            {user.email_pessoal || user.email}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onViewChange?.("social")}
                                    className="self-start shrink-0 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                                >
                                    Ver Rede Social
                                </button>
                            </div>

                            {/* Stats de gamificação — apenas alunos */}
                            {isAluno && (
                                <>
                                    <div className="mt-6 grid gap-4 grid-cols-3">
                                        <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                                XP Total
                                            </p>
                                            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                                                {xpTotal}
                                            </p>
                                        </div>
                                        <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                                Nível Atual
                                            </p>
                                            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                                                {nivelAtual}
                                            </p>
                                        </div>
                                        <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                                Badges Conquistadas (
                                                {badgesCount})
                                            </p>
                                            <div className="mt-2 flex items-center justify-around">
                                                <MedalStat
                                                    type="ouro"
                                                    count={badgesOuro}
                                                />
                                                <MedalStat
                                                    type="prata"
                                                    count={badgesPrata}
                                                />
                                                <MedalStat
                                                    type="bronze"
                                                    count={badgesBronze}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    Progresso para o próximo
                                                    nível
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {xpNoNivel} / {xpNecessarioNivel}{" "}
                                                    XP &nbsp;·&nbsp;{" "}
                                                    {Math.round(percentagemNivel)}%
                                                </p>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Nível {nivelAtual + 1}
                                            </span>
                                        </div>
                                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-[width] duration-500"
                                                style={{ width: `${percentagemNivel}%` }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Conexões da Rede */}
                        <div className="rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Conexões da Rede
                            </h2>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Seguindo {seguindo} pessoas, com {seguidores}{" "}
                                seguidores e {conexoes} conexões mútuas.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                    onClick={() => onViewChange?.("social")}
                                    className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
                                >
                                    Ir para Hub Social
                                </button>
                                <button
                                    onClick={() => onOpenPerfil?.(user.id)}
                                    className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 dark:border-slate-600 dark:text-slate-100"
                                >
                                    Ver Perfil Público
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Sidebar direita */}
                    <aside className="space-y-6">
                        <div className="rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Perfil Social
                            </h2>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Atualiza o teu email pessoal para que outros
                                alunos possam encontrar-te fora da plataforma.
                            </p>
                            <div className="mt-6 grid gap-4">
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                        Email Pessoal
                                    </p>
                                    <p className="mt-2 text-sm text-slate-900 dark:text-white">
                                        {user.email_pessoal ||
                                            "Ainda não definido"}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                        Visibilidade
                                    </p>
                                    <p className="mt-2 text-sm text-slate-900 dark:text-white">
                                        Perfil público disponível na rede
                                        social.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {showForms && (
                <>
                    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-xl border border-gray-100 dark:border-gray-700">
                        <UpdateThemeForm className="max-w-xl" />
                    </div>
                    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-xl border border-gray-100 dark:border-gray-700">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>
                    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-xl border border-gray-100 dark:border-gray-700">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-xl border border-gray-100 dark:border-gray-700">
                        <TwoFactorSettingsForm />
                    </div>

                    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-xl border border-gray-100 dark:border-gray-700">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </>
            )}
        </div>
    );
}
