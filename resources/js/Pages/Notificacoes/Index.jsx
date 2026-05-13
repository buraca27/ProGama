import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";

function tipoLabel(tipo) {
    const map = {
        Novo_Desafio: "Novo desafio",
        Teste_Corrigido: "Avaliacao corrigida",
        Prazo_Proximo: "Prazo proximo",
        XP_Recebido: "XP recebido",
        Novo_Nivel: "Novo nivel",
        Badge_Ganho: "Badge ganha",
        Pedido_Conexao: "Pedido de conexão",
        Conexao_Aceite: "Conexão aceite",
        Conexao_Recusada: "Conexão recusada",
    };

    return map[tipo] ?? tipo;
}

export default function Index({ notificacoes }) {
    const items = notificacoes?.data ?? [];

    const marcarTodas = () => {
        router.post(route("notificacoes.ler-todas"));
    };

    const marcarLida = (id) => {
        router.post(
            route("notificacoes.ler", id),
            {},
            { preserveScroll: true },
        );
    };

    const aceitarPedido = (idUsuarioRelacionado) => {
        router.post(
            route("social.aceitar", idUsuarioRelacionado),
            {},
            { preserveScroll: true },
        );
    };

    const recusarPedido = (idUsuarioRelacionado) => {
        router.post(
            route("social.recusar", idUsuarioRelacionado),
            {},
            { preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Notificacoes" />

            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                            Centro de Notificacoes
                        </h1>
                        <p className="text-sm text-slate-500">
                            Eventos de desafios, prazos e notas.
                        </p>
                    </div>
                    <button
                        onClick={marcarTodas}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
                    >
                        Marcar todas como lidas
                    </button>
                </div>

                <div className="space-y-3">
                    {items.map((n) => (
                        <div
                            key={n.id}
                            className={`rounded-xl border p-4 ${n.lida ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800" : "border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20"}`}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                        {tipoLabel(n.tipo_notificacao)}
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                                        {n.mensagem}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {n.created_at
                                            ? new Date(
                                                  n.created_at,
                                              ).toLocaleString("pt-PT")
                                            : "-"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!n.lida && (
                                        <button
                                            onClick={() => marcarLida(n.id)}
                                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold dark:border-slate-600"
                                        >
                                            Marcar lida
                                        </button>
                                    )}

                                    {n.tipo_notificacao === "Pedido_Conexao" &&
                                        n.id_usuario_relacionado && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        aceitarPedido(
                                                            n.id_usuario_relacionado,
                                                        )
                                                    }
                                                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                                                >
                                                    Aceitar
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        recusarPedido(
                                                            n.id_usuario_relacionado,
                                                        )
                                                    }
                                                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold dark:border-slate-600"
                                                >
                                                    Recusar
                                                </button>
                                            </>
                                        )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
