import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";

const TIPO_LABEL = {
    Novo_Desafio: "Novo Desafio",
    Desafio_Corrigido: "Desafio Corrigido",
    Teste_Corrigido: "Avaliação Corrigida",
    Prazo_Proximo: "Prazo Próximo",
    XP_Recebido: "XP Recebido",
    Novo_Nivel: "Novo Nível",
    Badge_Ganho: "Badge Ganha",
    Submissao_Aluno: "Submissão de Aluno",
};

const TIPO_COR = {
    Novo_Desafio: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    Desafio_Corrigido: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    Teste_Corrigido: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    Prazo_Proximo: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    XP_Recebido: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    Novo_Nivel: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    Badge_Ganho: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    Submissao_Aluno: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
};

const TIPO_ICONE = {
    Novo_Desafio: "🎯",
    Desafio_Corrigido: "✅",
    Teste_Corrigido: "✅",
    Prazo_Proximo: "⏰",
    XP_Recebido: "⭐",
    Novo_Nivel: "🚀",
    Badge_Ganho: "🏅",
    Submissao_Aluno: "📝",
};

export default function Index({ notificacoes }) {
    const { userRoleReal, notifications: sharedNotifications } = usePage().props;

    // Proteção extra no frontend para admin/secretaria
    if (userRoleReal === "admin") {
        return (
            <AuthenticatedLayout>
                <Head title="Acesso Negado" />
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <span className="text-5xl mb-4">🚫</span>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                        Acesso Negado
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        A área de notificações não está disponível para a Secretaria.
                    </p>
                    <Link
                        href={route("dashboard")}
                        className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-gray-100 dark:text-gray-900"
                    >
                        Voltar ao Dashboard
                    </Link>
                </div>
            </AuthenticatedLayout>
        );
    }

    const items = notificacoes?.data ?? [];
    const paginaAtual = notificacoes?.current_page ?? 1;
    const ultimaPagina = notificacoes?.last_page ?? 1;
    const total = notificacoes?.total ?? 0;
    const naoLidasTotal = sharedNotifications?.unread_count ?? 0;
    
    // Links de paginação que utilizam o formato exato que vem da API do Laravel
    const prevHref = notificacoes?.prev_page_url ?? null;
    const nextHref = notificacoes?.next_page_url ?? null;

    const marcarTodas = () => {
        router.post(
            route("notificacoes.ler-todas"),
            {},
            { preserveScroll: true }
        );
    };

    const marcarLida = (id) => {
        router.post(route("notificacoes.ler", id), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Notificações" />

            <div className="space-y-6">
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                            🔔 Centro de Notificações
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {total} notificação{total !== 1 ? "ões" : ""} no total
                            {naoLidasTotal > 0 && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                    {naoLidasTotal} não lida{naoLidasTotal !== 1 ? "s" : ""}
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Botão sempre visível, apenas desativado visualmente quando não há lidas */}
                    <button
                        onClick={marcarTodas}
                        disabled={naoLidasTotal === 0}
                        className="self-start sm:self-auto rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        Marcar todas como lidas
                    </button>
                </div>

                {/* Lista de notificações */}
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-800">
                        <span className="text-4xl mb-3">🎉</span>
                        <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
                            Tudo em dia!
                        </p>
                        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                            Não tens notificações por ler.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((n) => (
                            <div
                                key={n.id}
                                className={`flex items-start justify-between gap-4 rounded-2xl border p-4 transition-all ${
                                    n.lida
                                        ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                                        : "border-blue-200 bg-blue-50 shadow-sm dark:border-blue-800 dark:bg-blue-900/20"
                                }`}
                            >
                                <div className="flex items-start gap-3 min-w-0">
                                    <span className="mt-0.5 text-xl flex-shrink-0">
                                        {TIPO_ICONE[n.tipo_notificacao] ?? "📌"}
                                    </span>
                                    <div className="min-w-0">
                                        <span
                                            className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                                                TIPO_COR[n.tipo_notificacao] ??
                                                "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                            }`}
                                        >
                                            {TIPO_LABEL[n.tipo_notificacao] ?? n.tipo_notificacao}
                                        </span>
                                        <p className="mt-1.5 text-sm font-medium text-gray-800 dark:text-gray-100">
                                            {n.mensagem}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                            {n.created_at
                                                ? new Date(n.created_at).toLocaleString("pt-PT", {
                                                      day: "2-digit",
                                                      month: "2-digit",
                                                      year: "numeric",
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                  })
                                                : "—"}
                                        </p>
                                    </div>
                                </div>

                                {!n.lida && (
                                    <button
                                        onClick={() => marcarLida(n.id)}
                                        className="flex-shrink-0 self-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                    >
                                        Marcar lida
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Paginação */}
                {ultimaPagina > 1 && (
                    <div className="flex items-center justify-between pt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Página {paginaAtual} de {ultimaPagina}
                        </p>
                        <div className="flex gap-2">
                            {prevHref ? (
                                <Link
                                    href={prevHref}
                                    preserveScroll
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                    ← Anterior
                                </Link>
                            ) : (
                                <span className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed">
                                    ← Anterior
                                </span>
                            )}
                            {nextHref ? (
                                <Link
                                    href={nextHref}
                                    preserveScroll
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                    Seguinte →
                                </Link>
                            ) : (
                                <span className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed">
                                    Seguinte →
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}