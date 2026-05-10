import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "@inertiajs/react";

function formatDateTime(value) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function statusTarefa(tarefa, submissao) {
    const now = new Date();
    const abre = tarefa?.data_hora_abertura
        ? new Date(tarefa.data_hora_abertura)
        : null;
    const fecha = tarefa?.data_hora_fecho
        ? new Date(tarefa.data_hora_fecho)
        : null;

    if (submissao?.data_submissao) {
        if (submissao.estado === "Corrigido") {
            return { label: "Corrigido", tone: "emerald" };
        }

        return { label: "Submetido", tone: "blue" };
    }

    if (abre && now < abre) {
        return { label: "Por abrir", tone: "slate" };
    }

    if (fecha && now > fecha) {
        return { label: "Prazo encerrado", tone: "red" };
    }

    return { label: "Disponivel", tone: "amber" };
}

function badgeClass(tone) {
    const classes = {
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        emerald:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    };

    return classes[tone] || classes.slate;
}

export default function TrabalhosView({
    tarefasAluno = [],
    submissoesAluno = [],
}) {
    const [selectedTarefaId, setSelectedTarefaId] = useState(
        tarefasAluno?.[0]?.id || null,
    );

    const tarefasOrdenadas = useMemo(
        () => [...(tarefasAluno || [])].sort((a, b) => b.id - a.id),
        [tarefasAluno],
    );

    const submissoesPorTeste = useMemo(() => {
        const map = new Map();

        (submissoesAluno || []).forEach((submissao) => {
            if (!map.has(submissao.id_teste)) {
                map.set(submissao.id_teste, submissao);
            }
        });

        return map;
    }, [submissoesAluno]);

    const selectedTarefa = useMemo(
        () =>
            tarefasOrdenadas.find((tarefa) => tarefa.id === selectedTarefaId) ||
            null,
        [tarefasOrdenadas, selectedTarefaId],
    );

    const submissaoAtual = useMemo(() => {
        if (!selectedTarefa) return null;
        return submissoesPorTeste.get(selectedTarefa.id_teste) || null;
    }, [selectedTarefa, submissoesPorTeste]);

    const teste = selectedTarefa?.teste || null;
    const perguntas = teste?.perguntas || [];

    const form = useForm({
        respostas: {},
    });

    useEffect(() => {
        if (!selectedTarefa) {
            form.setData("respostas", {});
            return;
        }

        const respostasExistentes = new Map(
            (submissaoAtual?.respostas || []).map((resposta) => [
                Number(resposta.id_pergunta),
                resposta,
            ]),
        );

        const iniciais = {};
        (selectedTarefa.teste?.perguntas || []).forEach((pergunta) => {
            const existente = respostasExistentes.get(Number(pergunta.id));
            iniciais[pergunta.id] = {
                id_pergunta: Number(pergunta.id),
                id_opcao_escolhida: existente?.id_opcao_escolhida
                    ? Number(existente.id_opcao_escolhida)
                    : null,
                resposta_texto: existente?.resposta_texto || "",
            };
        });

        form.setData("respostas", iniciais);
    }, [selectedTarefa, submissaoAtual]);

    useEffect(() => {
        if (!selectedTarefa && tarefasOrdenadas.length > 0) {
            setSelectedTarefaId(tarefasOrdenadas[0].id);
        }
    }, [selectedTarefa, tarefasOrdenadas]);

    const now = new Date();
    const abriu = selectedTarefa?.data_hora_abertura
        ? new Date(selectedTarefa.data_hora_abertura)
        : null;
    const fechou = selectedTarefa?.data_hora_fecho
        ? new Date(selectedTarefa.data_hora_fecho)
        : null;

    const bloqueadoPorData = (abriu && now < abriu) || (fechou && now > fechou);
    const jaSubmetido = Boolean(submissaoAtual?.data_submissao);
    const podeSubmeter =
        selectedTarefa &&
        perguntas.length > 0 &&
        !bloqueadoPorData &&
        !jaSubmetido;

    const onSelectOption = (idPergunta, idOpcao) => {
        const prev = form.data.respostas || {};
        form.setData("respostas", {
            ...prev,
            [idPergunta]: {
                ...(prev[idPergunta] || {
                    id_pergunta: Number(idPergunta),
                    resposta_texto: "",
                }),
                id_opcao_escolhida: Number(idOpcao),
            },
        });
    };

    const onChangeTexto = (idPergunta, value) => {
        const prev = form.data.respostas || {};
        form.setData("respostas", {
            ...prev,
            [idPergunta]: {
                ...(prev[idPergunta] || {
                    id_pergunta: Number(idPergunta),
                    id_opcao_escolhida: null,
                }),
                resposta_texto: value,
            },
        });
    };

    const submitTeste = (e) => {
        e.preventDefault();
        if (!selectedTarefa) return;

        const payloadRespostas = (selectedTarefa.teste?.perguntas || []).map(
            (pergunta) => {
                const resposta = form.data.respostas?.[pergunta.id] || {};

                return {
                    id_pergunta: Number(pergunta.id),
                    id_opcao_escolhida: resposta.id_opcao_escolhida || null,
                    resposta_texto: resposta.resposta_texto || "",
                };
            },
        );

        form.post(route("aluno.testes.submeter", selectedTarefa.id), {
            preserveScroll: true,
            data: {
                respostas: payloadRespostas,
            },
        });
    };

    if (!tarefasOrdenadas.length) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Trabalhos pendentes
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Ainda nao tens testes atribuidos.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <aside className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Testes atribuidos
                </h3>

                <div className="mt-4 space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                    {tarefasOrdenadas.map((tarefa) => {
                        const submissao = submissoesPorTeste.get(
                            tarefa.id_teste,
                        );
                        const status = statusTarefa(tarefa, submissao);
                        const active = tarefa.id === selectedTarefaId;

                        return (
                            <button
                                key={tarefa.id}
                                type="button"
                                onClick={() => setSelectedTarefaId(tarefa.id)}
                                className={`w-full text-left rounded-xl border p-3 transition ${
                                    active
                                        ? "border-blue-300 bg-blue-50/70 dark:border-blue-700 dark:bg-blue-900/20"
                                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 hover:border-blue-300 dark:hover:border-blue-600"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-2">
                                        {tarefa.teste?.titulo ||
                                            "Teste sem titulo"}
                                    </p>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeClass(status.tone)}`}
                                    >
                                        {status.label}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Abre:{" "}
                                    {formatDateTime(tarefa.data_hora_abertura)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Fecha:{" "}
                                    {formatDateTime(tarefa.data_hora_fecho)}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </aside>

            <section className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                {!selectedTarefa ? (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Seleciona um teste para responder.
                    </p>
                ) : (
                    <form onSubmit={submitTeste} className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {teste?.titulo || "Teste"}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                Tipo:{" "}
                                {String(
                                    teste?.tipo_avaliacao || "-",
                                ).replaceAll("_", " ")}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Janela:{" "}
                                {formatDateTime(
                                    selectedTarefa.data_hora_abertura,
                                )}{" "}
                                ate{" "}
                                {formatDateTime(selectedTarefa.data_hora_fecho)}
                            </p>
                            {teste?.instrucoes && (
                                <p className="mt-3 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                    {teste.instrucoes}
                                </p>
                            )}
                        </div>

                        {(form.errors.tarefa || form.errors.respostas) && (
                            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                                {form.errors.tarefa || form.errors.respostas}
                            </div>
                        )}

                        <div className="space-y-5">
                            {perguntas.map((pergunta, index) => {
                                const resposta =
                                    form.data.respostas?.[pergunta.id] || {};

                                return (
                                    <div
                                        key={pergunta.id}
                                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-4"
                                    >
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Pergunta {index + 1}
                                        </p>
                                        <h4 className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                                            {pergunta.texto}
                                        </h4>

                                        {pergunta.tipo_pergunta ===
                                        "Dissertativa" ? (
                                            <textarea
                                                value={
                                                    resposta.resposta_texto ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    onChangeTexto(
                                                        pergunta.id,
                                                        e.target.value,
                                                    )
                                                }
                                                rows={4}
                                                disabled={
                                                    !podeSubmeter ||
                                                    form.processing
                                                }
                                                className="mt-3 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Escreve a tua resposta..."
                                            />
                                        ) : (
                                            <div className="mt-3 space-y-2">
                                                {(pergunta.opcoes || []).map(
                                                    (opcao) => (
                                                        <label
                                                            key={opcao.id}
                                                            className="flex items-start gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`pergunta_${pergunta.id}`}
                                                                checked={
                                                                    Number(
                                                                        resposta.id_opcao_escolhida,
                                                                    ) ===
                                                                    Number(
                                                                        opcao.id,
                                                                    )
                                                                }
                                                                onChange={() =>
                                                                    onSelectOption(
                                                                        pergunta.id,
                                                                        opcao.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    !podeSubmeter ||
                                                                    form.processing
                                                                }
                                                                className="mt-1 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-700 dark:text-gray-200">
                                                                {
                                                                    opcao.texto_opcao
                                                                }
                                                            </span>
                                                        </label>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            {jaSubmetido && (
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    Este teste ja foi submetido em{" "}
                                    {formatDateTime(
                                        submissaoAtual.data_submissao,
                                    )}
                                    .
                                </p>
                            )}
                            {!jaSubmetido && bloqueadoPorData && (
                                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                    Este teste esta fora da janela de resolucao.
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={!podeSubmeter || form.processing}
                                className="ml-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {form.processing
                                    ? "A submeter..."
                                    : "Submeter teste"}
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </div>
    );
}
