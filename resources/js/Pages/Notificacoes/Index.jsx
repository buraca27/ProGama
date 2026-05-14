import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

function tipoLabel(tipo) {
    const map = {
        Novo_Desafio: "Novo desafio",
        Teste_Corrigido: "Avaliacao corrigida",
        Prazo_Proximo: "Prazo proximo",
        XP_Recebido: "XP recebido",
        Novo_Nivel: "Novo nivel",
        Badge_Ganho: "Badge ganha",
    };

    return map[tipo] ?? tipo;
}

export default function Index({ notificacoes }) {
    // Extrair os dados da paginação que o Laravel envia automaticamente
    const items = notificacoes?.data ?? [];
    const paginaAtual = notificacoes?.current_page ?? 1;
    const ultimaPagina = notificacoes?.last_page ?? 1;
    
    const prevHref = notificacoes?.prev_page_url ?? null;
    const nextHref = notificacoes?.next_page_url ?? null;

    const marcarTodas = () => {
        router.post(route("notificacoes.ler-todas"), {}, { preserveScroll: true });
    };

    const marcarLida = (id) => {
        router.post(route("notificacoes.ler", id), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Notificacoes" />

            <div className="space-y-5">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Centro de Notificacoes</h1>
                        <p className="text-sm text-slate-500">Eventos de desafios, prazos e notas.</p>
                    </div>
                    <button
                        onClick={marcarTodas}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900 disabled:opacity-50"
                    >
                        Marcar todas como lidas
                    </button>
                </div>

                {/* Lista de Notificações */}
                <div className="space-y-3">
                    {items.length === 0 ? (
                        <div className="py-10 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <p className="text-slate-500 dark:text-slate-400">Não existem notificações para apresentar.</p>
                        </div>
                    ) : (
                        items.map((n) => (
                            <div
                                key={n.id}
                                className={`rounded-xl border p-4 ${n.lida ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800" : "border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20"}`}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-slate-500">{tipoLabel(n.tipo_notificacao)}</p>
                                        <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">{n.mensagem}</p>
                                        <p className="mt-1 text-xs text-slate-500">{n.created_at ? new Date(n.created_at).toLocaleString("pt-PT") : "-"}</p>
                                    </div>
                                    {!n.lida && (
                                        <button
                                            onClick={() => marcarLida(n.id)}
                                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 transition"
                                        >
                                            Marcar lida
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Paginação */}
                {ultimaPagina > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Página {paginaAtual} de {ultimaPagina}
                        </p>
                        <div className="flex gap-2">
                            {prevHref ? (
                                <Link
                                    href={prevHref}
                                    preserveScroll
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                >
                                    ← Anterior
                                </Link>
                            ) : (
                                <span className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed">
                                    ← Anterior
                                </span>
                            )}
                            {nextHref ? (
                                <Link
                                    href={nextHref}
                                    preserveScroll
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                >
                                    Seguinte →
                                </Link>
                            ) : (
                                <span className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed">
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