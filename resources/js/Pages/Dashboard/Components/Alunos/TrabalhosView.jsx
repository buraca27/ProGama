// resources/js/Pages/Dashboard/Components/Alunos/TrabalhosView.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useForm, router } from "@inertiajs/react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
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
        return submissao.estado === "Corrigido"
            ? { label: "Corrigido", tone: "emerald" }
            : { label: "Submetido", tone: "blue" };
    }

    if (submissao && !submissao.data_submissao) {
        return { label: "Rascunho guardado", tone: "violet" };
    }

    if (abre && now < abre) return { label: "Por abrir", tone: "slate" };
    if (fecha && now > fecha) return { label: "Prazo encerrado", tone: "red" };

    return { label: "Disponível", tone: "amber" };
}

function badgeClass(tone) {
    const classes = {
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        emerald:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    };
    return classes[tone] || classes.slate;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function TrabalhosView({
    tarefasAluno = [],
    submissoesAluno = [],
}) {
    const [selectedTarefaId, setSelectedTarefaId] = useState(null);
    const [toastMsg, setToastMsg] = useState(null);

    const mostrarToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 4000);
    };

    const tarefasOrdenadas = useMemo(
        () => [...(tarefasAluno || [])].sort((a, b) => b.id - a.id),
        [tarefasAluno],
    );

    // Map: id_teste → submissao mais recente
    const submissoesPorTeste = useMemo(() => {
        const map = new Map();
        (submissoesAluno || []).forEach((s) => {
            if (!map.has(s.id_teste)) map.set(s.id_teste, s);
        });
        return map;
    }, [submissoesAluno]);

    // Auto-selecionar primeira tarefa
    useEffect(() => {
        if (!selectedTarefaId && tarefasOrdenadas.length > 0) {
            setSelectedTarefaId(tarefasOrdenadas[0].id);
        }
    }, [tarefasOrdenadas]);

    const selectedTarefa = useMemo(
        () => tarefasOrdenadas.find((t) => t.id === selectedTarefaId) || null,
        [tarefasOrdenadas, selectedTarefaId],
    );

    const submissaoAtual = useMemo(() => {
        if (!selectedTarefa) return null;
        return submissoesPorTeste.get(selectedTarefa.id_teste) || null;
    }, [selectedTarefa, submissoesPorTeste]);

    const teste = selectedTarefa?.teste || null;
    const perguntas = teste?.perguntas || [];

    // ── Form ────────────────────────────────────────────────────────────────

    const form = useForm({ respostas: {} });

    // Carregar respostas do rascunho ou submissão existente
    useEffect(() => {
        if (!selectedTarefa) {
            form.setData("respostas", {});
            return;
        }

        const respostasExistentes = new Map(
            (submissaoAtual?.respostas || []).map((r) => [
                Number(r.id_pergunta),
                r,
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
                ids_opcoes_escolhidas: Array.isArray(
                    existente?.ids_opcoes_escolhidas,
                )
                    ? existente.ids_opcoes_escolhidas.map((id) => Number(id))
                    : [],
                resposta_texto: existente?.resposta_texto || "",
            };
        });

        form.setData("respostas", iniciais);
    }, [selectedTarefa, submissaoAtual]);

    // ── Lógica de janela e Tentativas ────────────────────────────────────────

    const now = new Date();
    const abriu = selectedTarefa?.data_hora_abertura
        ? new Date(selectedTarefa.data_hora_abertura)
        : null;
    const fechou = selectedTarefa?.data_hora_fecho
        ? new Date(selectedTarefa.data_hora_fecho)
        : null;

    const bloqueadoPorData = (abriu && now < abriu) || (fechou && now > fechou);

    const totalTentativasFeitas = (submissoesAluno || []).filter(
        (s) => s.id_teste === selectedTarefa?.id_teste && s.data_submissao,
    ).length;

    const limiteTentativas = selectedTarefa?.tentativas_maximas || null;
    const esgotouTentativas = limiteTentativas
        ? totalTentativasFeitas >= limiteTentativas
        : false;

    const temRascunho = Boolean(
        submissaoAtual && !submissaoAtual.data_submissao,
    );

    const podeInteragir =
        selectedTarefa &&
        perguntas.length > 0 &&
        !bloqueadoPorData &&
        !esgotouTentativas;

    // ── Input handlers ───────────────────────────────────────────────────────

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
                ids_opcoes_escolhidas: [Number(idOpcao)],
            },
        });
    };

    const onToggleMultipleOption = (idPergunta, idOpcao) => {
        const prev = form.data.respostas || {};
        const respostaAtual = prev[idPergunta] || {
            id_pergunta: Number(idPergunta),
            resposta_texto: "",
            ids_opcoes_escolhidas: [],
        };

        const opcoesSelecionadas = respostaAtual.ids_opcoes_escolhidas || [];
        const idOpcaoNum = Number(idOpcao);

        // Toggle: se já está selecionada, remove; senão, adiciona
        const novasOpcoes = opcoesSelecionadas.includes(idOpcaoNum)
            ? opcoesSelecionadas.filter((id) => id !== idOpcaoNum)
            : [...opcoesSelecionadas, idOpcaoNum];

        form.setData("respostas", {
            ...prev,
            [idPergunta]: {
                ...respostaAtual,
                id_opcao_escolhida: novasOpcoes[0] || null,
                ids_opcoes_escolhidas: novasOpcoes,
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

    // ── Payload ──────────────────────────────────────────────────────────────

    const buildPayload = () =>
        (selectedTarefa?.teste?.perguntas || []).map((pergunta) => {
            const r = form.data.respostas?.[pergunta.id] || {};
            return {
                id_pergunta: Number(pergunta.id),
                id_opcao_escolhida: r.id_opcao_escolhida || null,
                ids_opcoes_escolhidas: r.ids_opcoes_escolhidas || [],
                resposta_texto: r.resposta_texto || "",
            };
        });

    // ── Guardar rascunho ─────────────────────────────────────────────────────

    const handleGuardarRascunho = () => {
        if (!selectedTarefa) return;

        form.clearErrors();

        router.post(
            route("aluno.testes.submeter", selectedTarefa.id),
            {
                respostas: buildPayload(),
                finalizar: false, // Força a ser rascunho
            },
            {
                preserveScroll: true,
                onSuccess: () => mostrarToast("Rascunho guardado com sucesso."),
                onError: (erros) => {
                    console.error(
                        "🚨 Erros recebidos do backend (Rascunho):",
                        erros,
                    );
                    form.setError(erros);
                    mostrarToast(
                        "Erro ao guardar! Verifica os avisos a vermelho.",
                    );
                },
            },
        );
    };

    // ── Submissão final ──────────────────────────────────────────────────────

    const handleSubmeterFinal = () => {
        if (!selectedTarefa) return;

        form.clearErrors();

        router.post(
            route("aluno.testes.submeter", selectedTarefa.id),
            {
                respostas: buildPayload(),
                finalizar: true,
            },
            {
                preserveScroll: true,
                onError: (erros) => {
                    console.error(
                        "🚨 Erros recebidos do backend (Submissão):",
                        erros,
                    );
                    form.setError(erros);
                },
            },
        );
    };

    // ── Empty state ──────────────────────────────────────────────────────────

    if (!tarefasOrdenadas.length) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Trabalhos pendentes
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Ainda não tens testes atribuídos.
                </p>
            </div>
        );
    }

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <>
            {/* Toast de feedback */}
            {toastMsg && (
                <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 p-4 max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 font-bold text-lg">
                        ✓
                    </div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex-1">
                        {toastMsg}
                    </p>
                    <button
                        type="button"
                        onClick={() => setToastMsg(null)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Sidebar: lista de tarefas ─────────────────────────── */}
                <aside className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Testes atribuídos
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
                                    onClick={() =>
                                        setSelectedTarefaId(tarefa.id)
                                    }
                                    className={`w-full text-left rounded-xl border p-3 transition ${
                                        active
                                            ? "border-blue-300 bg-blue-50/70 dark:border-blue-700 dark:bg-blue-900/20"
                                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 hover:border-blue-300 dark:hover:border-blue-600"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-2">
                                            {tarefa.teste?.titulo ||
                                                "Teste sem título"}
                                        </p>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${badgeClass(status.tone)}`}
                                        >
                                            {status.label}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Abre:{" "}
                                        {formatDateTime(
                                            tarefa.data_hora_abertura,
                                        )}
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

                {/* ── Área de resolução ─────────────────────────────────── */}
                <section className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    {!selectedTarefa ? (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Seleciona um teste para responder.
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {/* Cabeçalho do teste */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {teste?.titulo || "Teste"}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                    Tipo:{" "}
                                    {String(
                                        teste?.tipo_avaliacao || "—",
                                    ).replaceAll("_", " ")}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Janela:{" "}
                                    {formatDateTime(
                                        selectedTarefa.data_hora_abertura,
                                    )}{" "}
                                    até{" "}
                                    {formatDateTime(
                                        selectedTarefa.data_hora_fecho,
                                    )}
                                </p>
                                <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                                    Tentativas submetidas:{" "}
                                    {totalTentativasFeitas} /{" "}
                                    {limiteTentativas || "Ilimitadas"}
                                </p>
                                {teste?.instrucoes && (
                                    <p className="mt-3 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                        {teste.instrucoes}
                                    </p>
                                )}
                            </div>

                            {/* Banner de rascunho */}
                            {temRascunho && (
                                <div className="flex items-center gap-2 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-4 py-3 text-sm text-violet-700 dark:text-violet-300">
                                    <span className="font-semibold">
                                        Rascunho guardado.
                                    </span>
                                    <span>
                                        As tuas respostas foram carregadas
                                        automaticamente.
                                    </span>
                                </div>
                            )}

                            {/* Erros do backend */}
                            {(form.errors.tarefa || form.errors.respostas) && (
                                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                                    {form.errors.tarefa ||
                                        form.errors.respostas}
                                </div>
                            )}

                            {/* Perguntas */}
                            <div className="space-y-5">
                                {perguntas.map((pergunta, index) => {
                                    const resposta =
                                        form.data.respostas?.[pergunta.id] ||
                                        {};

                                    return (
                                        <div
                                            key={pergunta.id}
                                            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4"
                                        >
                                            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                                                Pergunta {index + 1}
                                            </p>
                                            <h4 className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                                                {pergunta.texto}
                                            </h4>

                                            {pergunta.url_anexo_pergunta && (
                                                <img
                                                    src={
                                                        pergunta.url_anexo_pergunta
                                                    }
                                                    alt="Anexo"
                                                    className="mt-3 max-h-48 rounded-lg object-contain border border-gray-200 dark:border-gray-700"
                                                />
                                            )}

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
                                                        !podeInteragir ||
                                                        form.processing
                                                    }
                                                    placeholder="Escreve a tua resposta..."
                                                    className="mt-3 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500 disabled:opacity-60"
                                                />
                                            ) : (
                                                <div className="mt-3 space-y-2">
                                                    {(
                                                        pergunta.opcoes || []
                                                    ).map((opcao) => {
                                                        const isMultipleChoice =
                                                            pergunta.tipo_pergunta ===
                                                            "Escolha_Multipla";
                                                        const opcoesSelecionadas =
                                                            resposta.ids_opcoes_escolhidas ||
                                                            [];

                                                        const checked =
                                                            isMultipleChoice
                                                                ? opcoesSelecionadas.includes(
                                                                      Number(
                                                                          opcao.id,
                                                                      ),
                                                                  )
                                                                : Number(
                                                                      resposta.id_opcao_escolhida,
                                                                  ) ===
                                                                  Number(
                                                                      opcao.id,
                                                                  );

                                                        return (
                                                            <label
                                                                key={opcao.id}
                                                                className={`flex items-start gap-3 rounded-lg border px-3 py-2 transition ${
                                                                    checked
                                                                        ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
                                                                        : "border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800/60"
                                                                } ${!podeInteragir ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                                                            >
                                                                <input
                                                                    type={
                                                                        isMultipleChoice
                                                                            ? "checkbox"
                                                                            : "radio"
                                                                    }
                                                                    name={
                                                                        isMultipleChoice
                                                                            ? undefined
                                                                            : `pergunta_${pergunta.id}`
                                                                    }
                                                                    checked={
                                                                        checked
                                                                    }
                                                                    onChange={() =>
                                                                        isMultipleChoice
                                                                            ? onToggleMultipleOption(
                                                                                  pergunta.id,
                                                                                  opcao.id,
                                                                              )
                                                                            : onSelectOption(
                                                                                  pergunta.id,
                                                                                  opcao.id,
                                                                              )
                                                                    }
                                                                    disabled={
                                                                        !podeInteragir ||
                                                                        form.processing
                                                                    }
                                                                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                                                                />
                                                                <span className="text-sm text-gray-700 dark:text-gray-200">
                                                                    {
                                                                        opcao.texto_opcao
                                                                    }
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Rodapé: estado + botões */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div>
                                    {esgotouTentativas && (
                                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                            Atingiste o limite máximo de
                                            tentativas para este teste.
                                        </p>
                                    )}
                                    {!esgotouTentativas &&
                                        submissaoAtual?.data_submissao && (
                                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                Última submissão em{" "}
                                                {formatDateTime(
                                                    submissaoAtual.data_submissao,
                                                )}
                                                .
                                            </p>
                                        )}
                                    {!esgotouTentativas && bloqueadoPorData && (
                                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                            Este teste está fora da janela de
                                            resolução.
                                        </p>
                                    )}
                                    {!esgotouTentativas &&
                                        !bloqueadoPorData &&
                                        perguntas.length === 0 && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Este teste não tem perguntas
                                                configuradas.
                                            </p>
                                        )}
                                </div>

                                {podeInteragir && (
                                    <div className="flex items-center gap-3 ml-auto">
                                        <button
                                            type="button"
                                            onClick={handleGuardarRascunho}
                                            disabled={form.processing}
                                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
                                        >
                                            {form.processing
                                                ? "A guardar..."
                                                : "Guardar rascunho"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleSubmeterFinal}
                                            disabled={form.processing}
                                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed transition"
                                        >
                                            {form.processing
                                                ? "A submeter..."
                                                : "Submeter teste"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
