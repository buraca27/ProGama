import { router, usePage } from "@inertiajs/react";
import PrazoCountdownItem from "@/Components/PrazoCountdownItem";

const TIPO_LABEL = {
    Novo_Desafio: "Novo Desafio",
    Desafio_Corrigido: "Desafio Corrigido",
    Teste_Corrigido: "Avaliação Corrigida",
    XP_Recebido: "XP Recebido",
    Novo_Nivel: "Novo Nível",
    Badge_Ganho: "Badge Ganha",
    Submissao_Aluno: "Submissão de Aluno",
    Alerta_Integridade: "Alerta de Integridade",
    Alteracao_Datas: "Datas Alteradas",
    Pedido_Conexao: "Pedido de Conexão",
    Conexao_Aceite: "Conexão Aceite",
    Conexao_Recusada: "Conexão Recusada",
};

const TIPO_COR = {
    Novo_Desafio: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    Desafio_Corrigido: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    Teste_Corrigido: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    XP_Recebido: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    Novo_Nivel: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    Badge_Ganho: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    Submissao_Aluno: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    Alerta_Integridade: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    Alteracao_Datas: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    Pedido_Conexao: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    Conexao_Aceite: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    Conexao_Recusada: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

const TIPO_ICONE = {
    Novo_Desafio: "🎯",
    Desafio_Corrigido: "✅",
    Teste_Corrigido: "✅",
    XP_Recebido: "⭐",
    Novo_Nivel: "🚀",
    Badge_Ganho: "🏅",
    Submissao_Aluno: "📝",
    Alerta_Integridade: "🚨",
    Alteracao_Datas: "📅",
    Pedido_Conexao: "👤",
    Conexao_Aceite: "🤝",
    Conexao_Recusada: "👋",
};

const FILTRO_CHIPS = [
    { value: null,             label: "Todas" },
    { value: "Prazo_Proximo",  label: "⏰ Prazos Próximos" },
    { value: "Novo_Desafio",   label: "Novo Desafio" },
];

export default function NotificacoesView({ notificacoesData }) {
    const { notifications: sharedNotifications, notifFiltros, prazo_alertas } = usePage().props;

    const items        = notificacoesData?.data ?? [];
    const paginaAtual  = notificacoesData?.current_page ?? 1;
    const ultimaPagina = notificacoesData?.last_page ?? 1;
    const total        = notificacoesData?.total ?? 0;
    const naoLidasTotal = sharedNotifications?.unread_count ?? 0;
    const prazoAlertas  = prazo_alertas ?? [];

    const tipoAtivo  = notifFiltros?.tipo  ?? null;
    const ordemAtiva = notifFiltros?.ordem ?? "desc";

    // Quando o chip Prazo Próximo está ativo, renderiza a secção visual — não vai à BD
    const mostraPrazos = tipoAtivo === "Prazo_Proximo";

    const aplicarFiltro = (novoTipo, novaOrdem) => {
        const data = {};
        if (novoTipo)                          data.notif_tipo  = novoTipo;
        if (novaOrdem && novaOrdem !== "desc") data.notif_ordem = novaOrdem;
        router.visit(route("dashboard", data), {
            only: ["notificacoesData", "notifFiltros", "prazo_alertas"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => window.history.replaceState(null, "", route("dashboard")),
        });
    };

    const mudarPagina = (pagina) => {
        const data = { notif_page: pagina };
        if (tipoAtivo)             data.notif_tipo  = tipoAtivo;
        if (ordemAtiva !== "desc") data.notif_ordem = ordemAtiva;
        router.visit(route("dashboard", data), {
            only: ["notificacoesData"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => window.history.replaceState(null, "", route("dashboard")),
        });
    };

    const marcarTodas = () => {
        router.post(route("notificacoes.ler-todas"), {}, { preserveScroll: true });
    };

    const marcarLida = (id, tipo = null, idDesafio = null, idSubmissao = null) => {
        router.post(route("notificacoes.ler", id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                if (tipo === "Submissao_Aluno" && idSubmissao) {
                    router.visit(route("dashboard", { view: "avaliacoes", submissao_id: idSubmissao }));
                } else if (tipo === "Desafio_Corrigido" && idDesafio) {
                    router.visit(route("dashboard", { view: "desafios" }));
                } else if (idDesafio) {
                    router.visit(route("dashboard", { view: "notificacoes", desafio_modal_id: idDesafio }));
                }
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                        🔔 Centro de Notificações
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {mostraPrazos
                            ? `${prazoAlertas.length} prazo${prazoAlertas.length !== 1 ? "s" : ""} ativo${prazoAlertas.length !== 1 ? "s" : ""}`
                            : `${total} notificação${total !== 1 ? "ões" : ""} no total`}
                        {!mostraPrazos && naoLidasTotal > 0 && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                {naoLidasTotal} não lida{naoLidasTotal !== 1 ? "s" : ""}
                            </span>
                        )}
                    </p>
                </div>
                {!mostraPrazos && (
                    <button
                        onClick={marcarTodas}
                        disabled={naoLidasTotal === 0}
                        className="self-start sm:self-auto rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        Marcar todas como lidas
                    </button>
                )}
            </div>

            {/* Barra de filtros */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                    {FILTRO_CHIPS.map((chip) => {
                        const ativo = tipoAtivo === chip.value;
                        return (
                            <button
                                key={chip.value ?? "todas"}
                                type="button"
                                onClick={() => aplicarFiltro(chip.value, ordemAtiva)}
                                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition border ${
                                    ativo
                                        ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-600 dark:text-white dark:border-blue-600"
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                                }`}
                            >
                                {chip.label}
                            </button>
                        );
                    })}
                </div>

                {/* Ordenação — só faz sentido para notificações BD */}
                {!mostraPrazos && (
                    <>
                        <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-700" />
                        <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
                            <button
                                type="button"
                                onClick={() => aplicarFiltro(tipoAtivo, "desc")}
                                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                                    ordemAtiva === "desc"
                                        ? "bg-blue-600 text-white dark:bg-blue-600 dark:text-white"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                }`}
                            >
                                Mais recentes
                            </button>
                            <button
                                type="button"
                                onClick={() => aplicarFiltro(tipoAtivo, "asc")}
                                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                                    ordemAtiva === "asc"
                                        ? "bg-blue-600 text-white dark:bg-blue-600 dark:text-white"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                }`}
                            >
                                Mais antigas
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Vista: Prazos Próximos (visual, sem BD) */}
            {mostraPrazos && (
                prazoAlertas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-800">
                        <span className="text-4xl mb-3">✅</span>
                        <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
                            Sem prazos próximos!
                        </p>
                        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                            Não tens desafios com prazo pendente.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {prazoAlertas.map((alerta) => (
                            <PrazoCountdownItem key={alerta.id_atribuicao ?? alerta.id_desafio} alerta={alerta} />
                        ))}
                    </div>
                )
            )}

            {/* Vista: Notificações da BD */}
            {!mostraPrazos && (
                <>
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-800">
                            <span className="text-4xl mb-3">🎉</span>
                            <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
                                {tipoAtivo ? "Nenhuma notificação deste tipo." : "Tudo em dia!"}
                            </p>
                            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                                {tipoAtivo ? "Experimenta remover o filtro para veres todas." : "Não tens notificações por ler."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => (n.id_desafio_relacionado || n.id_submissao_relacionada) && marcarLida(n.id, n.tipo_notificacao, n.id_desafio_relacionado ?? null, n.id_submissao_relacionada ?? null)}
                                    className={`flex items-start justify-between gap-4 rounded-2xl border p-4 transition-all ${
                                        n.lida
                                            ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                                            : "border-blue-200 bg-blue-50 shadow-sm dark:border-blue-800 dark:bg-blue-900/20"
                                    } ${(n.id_desafio_relacionado || n.id_submissao_relacionada) ? "cursor-pointer hover:shadow-md" : ""}`}
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <span className="mt-0.5 text-xl flex-shrink-0">
                                            {TIPO_ICONE[n.tipo_notificacao] ?? "📌"}
                                        </span>
                                        <div className="min-w-0">
                                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${TIPO_COR[n.tipo_notificacao] ?? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>
                                                {TIPO_LABEL[n.tipo_notificacao] ?? n.tipo_notificacao}
                                            </span>
                                            <p className="mt-1.5 text-sm font-medium text-gray-800 dark:text-gray-100">
                                                {n.mensagem}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                                {n.created_at
                                                    ? new Date(n.created_at).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                                    : "—"}
                                            </p>
                                            {(n.id_desafio_relacionado || n.id_submissao_relacionada) && (
                                                <p className="mt-1 text-xs font-semibold text-blue-500 dark:text-blue-400">
                                                    {n.tipo_notificacao === "Submissao_Aluno"
                                                        ? "Ver respostas →"
                                                        : n.tipo_notificacao === "Desafio_Corrigido"
                                                          ? "Ver nota do desafio →"
                                                          : "Iniciar desafio →"}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {!n.lida && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); marcarLida(n.id); }}
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
                                <button
                                    onClick={() => mudarPagina(paginaAtual - 1)}
                                    disabled={paginaAtual <= 1}
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                    ← Anterior
                                </button>
                                <button
                                    onClick={() => mudarPagina(paginaAtual + 1)}
                                    disabled={paginaAtual >= ultimaPagina}
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                    Seguinte →
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
