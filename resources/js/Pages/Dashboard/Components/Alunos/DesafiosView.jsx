import React, { useEffect, useMemo, useState } from "react";
import { useForm, router } from "@inertiajs/react";

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

function statusDesafio(atribuicao, inscricao) {
    const now = new Date();
    const abre = atribuicao?.desafio?.data_inicio
        ? new Date(atribuicao.desafio.data_inicio)
        : null;
    const fecha = atribuicao?.desafio?.data_fim
        ? new Date(atribuicao.desafio.data_fim)
        : null;

    if (inscricao && ["Submetido", "Concluido", "Avaliado"].includes(inscricao.estado)) {
        if (inscricao.estado === "Avaliado") {
            return { label: "Avaliado", tone: "emerald" };
        }

        return inscricao.estado === "Concluido"
            ? { label: "Concluido", tone: "emerald" }
            : { label: "Submetido", tone: "blue" };
    }

    if (inscricao?.estado === "Falhado") {
        return { label: "Falhado", tone: "red" };
    }

    if (inscricao && inscricao.estado === "Em_Resolucao") {
        return { label: "Rascunho guardado", tone: "violet" };
    }

    if (abre && now < abre) return { label: "Por abrir", tone: "slate" };
    if (fecha && now > fecha) return { label: "Prazo encerrado", tone: "red" };

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
        violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    };
    return classes[tone] || classes.slate;
}

function getPerguntas(desafio) {
    if (!desafio) return [];
    if (Array.isArray(desafio.perguntas) && desafio.perguntas.length > 0) {
        return desafio.perguntas;
    }
    return desafio.teste_associado?.perguntas || [];
}

export default function DesafiosView({
    desafiosAluno = [],
    inscricoesDesafiosAluno = [],
}) {
    const [selectedAtribuicaoId, setSelectedAtribuicaoId] = useState(null);
    const [toastMsg, setToastMsg] = useState(null);

    const mostrarToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 4000);
    };

    const desafiosOrdenados = useMemo(
        () => [...(desafiosAluno || [])].sort((a, b) => b.id - a.id),
        [desafiosAluno],
    );

    const inscricoesPorDesafio = useMemo(() => {
        const map = new Map();
        (inscricoesDesafiosAluno || []).forEach((i) => {
            if (!map.has(i.id_desafio)) map.set(i.id_desafio, i);
        });
        return map;
    }, [inscricoesDesafiosAluno]);

    useEffect(() => {
        if (!selectedAtribuicaoId && desafiosOrdenados.length > 0) {
            setSelectedAtribuicaoId(desafiosOrdenados[0].id);
        }
    }, [desafiosOrdenados]);

    const selectedAtribuicao = useMemo(
        () =>
            desafiosOrdenados.find((d) => d.id === selectedAtribuicaoId) ||
            null,
        [desafiosOrdenados, selectedAtribuicaoId],
    );

    const inscricaoAtual = useMemo(() => {
        if (!selectedAtribuicao) return null;
        return inscricoesPorDesafio.get(selectedAtribuicao.id_desafio) || null;
    }, [selectedAtribuicao, inscricoesPorDesafio]);

    const desafio = selectedAtribuicao?.desafio || null;
    const perguntas = getPerguntas(desafio);

    const form = useForm({ respostas: {} });

    useEffect(() => {
        if (!selectedAtribuicao) {
            form.setData("respostas", {});
            return;
        }

        const respostasExistentes = new Map(
            (inscricaoAtual?.respostas || []).map((r) => [
                Number(r.id_pergunta),
                r,
            ]),
        );

        const iniciais = {};
        getPerguntas(selectedAtribuicao.desafio).forEach((pergunta) => {
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
    }, [selectedAtribuicao, inscricaoAtual]);

    const now = new Date();
    const abriu = desafio?.data_inicio ? new Date(desafio.data_inicio) : null;
    const fechou = desafio?.data_fim ? new Date(desafio.data_fim) : null;

    const bloqueadoPorData = (abriu && now < abriu) || (fechou && now > fechou);

    const totalTentativasFeitas = (inscricoesDesafiosAluno || []).filter(
        (i) =>
            i.id_desafio === selectedAtribuicao?.id_desafio &&
            ["Submetido", "Concluido", "Falhado"].includes(i.estado),
    ).length;

    const limiteTentativas = selectedAtribuicao?.tentativas_maximas || null;
    const esgotouTentativas = limiteTentativas
        ? totalTentativasFeitas >= limiteTentativas
        : false;

    const temRascunho = Boolean(
        inscricaoAtual && inscricaoAtual.estado === "Em_Resolucao",
    );

    const desafioFechado = Boolean(
        inscricaoAtual && ["Avaliado", "Concluido"].includes(inscricaoAtual.estado),
    );

    const podeInteragir =
        selectedAtribuicao &&
        perguntas.length > 0 &&
        !bloqueadoPorData &&
        !desafioFechado &&
        !esgotouTentativas;

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

    const buildPayload = () =>
        getPerguntas(desafio).map((pergunta) => {
            const r = form.data.respostas?.[pergunta.id] || {};
            return {
                id_pergunta: Number(pergunta.id),
                id_opcao_escolhida: r.id_opcao_escolhida || null,
                ids_opcoes_escolhidas: r.ids_opcoes_escolhidas || [],
                resposta_texto: r.resposta_texto || "",
            };
        });

    const handleGuardarRascunho = () => {
        if (!selectedAtribuicao) return;

        form.clearErrors();

        router.post(
            route("aluno.desafios.submeter", selectedAtribuicao.id),
            {
                respostas: buildPayload(),
                finalizar: false,
            },
            {
                preserveScroll: true,
                onSuccess: () => mostrarToast("Rascunho guardado com sucesso."),
                onError: (erros) => {
                    form.setError(erros);
                    mostrarToast(
                        "Erro ao guardar! Verifica os avisos a vermelho.",
                    );
                },
            },
        );
    };

    const handleSubmeterFinal = () => {
        if (!selectedAtribuicao) return;

        form.clearErrors();

        router.post(
            route("aluno.desafios.submeter", selectedAtribuicao.id),
            {
                respostas: buildPayload(),
                finalizar: true,
            },
            {
                preserveScroll: true,
                onError: (erros) => {
                    form.setError(erros);
                },
            },
        );
    };

    if (!desafiosOrdenados.length) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Desafios pendentes
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Ainda nao tens desafios atribuidos.
                </p>
            </div>
        );
    }

    return (
        <>
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
                <aside className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Desafios atribuidos
                    </h3>

                    <div className="mt-4 space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                        {desafiosOrdenados.map((atribuicao) => {
                            const inscricao = inscricoesPorDesafio.get(
                                atribuicao.id_desafio,
                            );
                            const status = statusDesafio(atribuicao, inscricao);
                            const active =
                                atribuicao.id === selectedAtribuicaoId;

                            return (
                                <button
                                    key={atribuicao.id}
                                    type="button"
                                    onClick={() =>
                                        setSelectedAtribuicaoId(atribuicao.id)
                                    }
                                    className={`w-full text-left rounded-xl border p-3 transition ${
                                        active
                                            ? "border-blue-300 bg-blue-50/70 dark:border-blue-700 dark:bg-blue-900/20"
                                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 hover:border-blue-300 dark:hover:border-blue-600"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-2">
                                            {atribuicao.desafio?.titulo ||
                                                "Desafio sem titulo"}
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
                                            atribuicao.desafio?.data_inicio,
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Fecha:{" "}
                                        {formatDateTime(
                                            atribuicao.desafio?.data_fim,
                                        )}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <section className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    {!selectedAtribuicao ? (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Seleciona um desafio para responder.
                        </p>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {desafio?.titulo || "Desafio"}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                    Tipo:{" "}
                                    {String(
                                        desafio?.tipo_desafio || "—",
                                    ).replaceAll("_", " ")}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Janela:{" "}
                                    {formatDateTime(desafio?.data_inicio)} ate{" "}
                                    {formatDateTime(desafio?.data_fim)}
                                </p>
                                <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                                    Tentativas submetidas:{" "}
                                    {totalTentativasFeitas}
                                    {limiteTentativas &&
                                        ` / ${limiteTentativas}`}
                                    {!limiteTentativas && " (Ilimitadas)"}
                                </p>
                                {desafio?.duracao_minutos && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Duracao maxima por tentativa:{" "}
                                        {desafio.duracao_minutos} min
                                    </p>
                                )}
                                {desafio?.descricao && (
                                    <p className="mt-3 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                        {desafio.descricao}
                                    </p>
                                )}
                            </div>

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

                            {esgotouTentativas && (
                                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
                                    <p className="font-semibold">
                                        ⚠️ Tentativas esgotadas
                                    </p>
                                    <p className="mt-1">
                                        Esgotaste o número máximo de tentativas
                                        para este desafio ({limiteTentativas}).
                                        Não podes submeter mais respostas.
                                    </p>
                                </div>
                            )}

                            {desafioFechado && (
                                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 text-sm text-emerald-700 dark:text-emerald-300">
                                    <p className="font-semibold">
                                        Desafio fechado
                                    </p>
                                    <p className="mt-1">
                                        Este desafio já foi corrigido e fechado pelo professor. Não é possível submeter novamente.
                                    </p>
                                </div>
                            )}

                            {(form.errors.desafio || form.errors.respostas) && (
                                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                                    {form.errors.desafio ||
                                        form.errors.respostas}
                                </div>
                            )}

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

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div>
                                    {inscricaoAtual?.data_ultima_tentativa &&
                                        ["Submetido", "Concluido", "Avaliado"].includes(
                                            inscricaoAtual?.estado,
                                        ) && (
                                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                Ultima submissao em{" "}
                                                {formatDateTime(
                                                    inscricaoAtual.data_ultima_tentativa,
                                                )}
                                                .
                                            </p>
                                        )}
                                    {bloqueadoPorData && (
                                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                            Este desafio esta fora da janela de
                                            resolucao.
                                        </p>
                                    )}
                                    {!bloqueadoPorData &&
                                        perguntas.length === 0 && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Este desafio nao tem perguntas
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
                                                : "Submeter desafio"}
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
