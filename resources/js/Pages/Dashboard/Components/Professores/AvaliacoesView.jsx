import React, { useEffect, useMemo, useState } from "react";
import { router, useForm } from "@inertiajs/react";
import { formatDateTime, formatTipoPergunta, getStatusCorrecao } from "@/utils";
import TestStatusBadge from "../UI/TestStatusBadge";

function calcularTotais(submissao) {
    const mapaPontuacoes = new Map(
        (submissao?.teste?.perguntas || []).map((pergunta) => [
            pergunta.id,
            Number(pergunta?.pivot?.valor_pontuacao ?? 1),
        ]),
    );

    const totalMaximo = (submissao?.respostas || []).reduce(
        (acc, resposta) =>
            acc + Number(mapaPontuacoes.get(resposta.id_pergunta) || 1),
        0,
    );

    const totalObtido = (submissao?.respostas || []).reduce(
        (acc, resposta) => acc + Number(resposta.pontuacao_obtida || 0),
        0,
    );

    return { totalMaximo, totalObtido, mapaPontuacoes };
}

function formatarRespostaAluno(resposta) {
    const idsMarcados = Array.isArray(resposta?.ids_opcoes_escolhidas)
        ? resposta.ids_opcoes_escolhidas.map((id) => Number(id))
        : [];

    if (idsMarcados.length > 0) {
        const opcoesPergunta = resposta?.pergunta?.opcoes || [];
        const textos = opcoesPergunta
            .filter((opcao) => idsMarcados.includes(Number(opcao.id)))
            .map((opcao) => String(opcao.texto_opcao || "").trim())
            .filter(Boolean);

        if (textos.length > 0) {
            return textos.join(" | ");
        }
    }

    if (resposta?.resposta_texto) {
        return resposta.resposta_texto;
    }

    if (resposta?.opcao_escolhida?.texto_opcao) {
        return resposta.opcao_escolhida.texto_opcao;
    }

    return "(Sem resposta)";
}

export default function AvaliacoesView({ correcoesProfessor = null }) {
    const [selectedId, setSelectedId] = useState(null);

    const correcoesPaginadas = correcoesProfessor?.data || [];
    const paginaAtual = correcoesProfessor?.current_page || 1;
    const totalPaginas = correcoesProfessor?.last_page || 1;

    const selectedSubmissao = useMemo(
        () => correcoesPaginadas.find((item) => item.id === selectedId) || null,
        [correcoesPaginadas, selectedId],
    );

    useEffect(() => {
        if (
            selectedId !== null &&
            !correcoesPaginadas.some((item) => item.id === selectedId)
        ) {
            setSelectedId(null);
        }
    }, [correcoesPaginadas, selectedId]);

    const { totalMaximo, totalObtido, mapaPontuacoes } = useMemo(
        () => calcularTotais(selectedSubmissao),
        [selectedSubmissao],
    );

    const correcaoForm = useForm({
        respostas: [],
        publicar: false,
    });

    useEffect(() => {
        if (!selectedSubmissao) {
            correcaoForm.setData("respostas", []);
            return;
        }

        correcaoForm.setData(
            "respostas",
            (selectedSubmissao.respostas || []).map((resposta) => ({
                id: resposta.id,
                id_pergunta: resposta.id_pergunta,
                status_correcao: resposta.status_correcao || "Por_Avaliar",
                pontuacao_obtida: Number(resposta.pontuacao_obtida || 0),
                comentario_formador: resposta.comentario_formador || "",
            })),
        );
    }, [selectedSubmissao]);

    const pendentesPorSubmissao = (submissao) =>
        (submissao?.respostas || []).filter(
            (resposta) => resposta.status_correcao === "Por_Avaliar",
        ).length;

    const updateRespostaField = (index, field, value) => {
        const next = [...(correcaoForm.data.respostas || [])];
        next[index] = { ...next[index], [field]: value };
        correcaoForm.setData("respostas", next);
    };

    const submitCorrecao = (publicar) => {
        if (!selectedSubmissao) return;

        correcaoForm.transform((data) => ({
            ...data,
            publicar,
        }));

        correcaoForm.put(
            route("professor.correcoes.update", selectedSubmissao.id),
            {
                preserveScroll: true,
                onFinish: () => correcaoForm.transform((data) => data),
            },
        );
    };

    const mudarPagina = (page) => {
        setSelectedId(null);

        router.get(
            route("dashboard"),
            {
                correcoes_page: page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ["correcoesProfessor"],
            },
        );
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <aside className="xl:col-span-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 space-y-3 max-h-[78vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Submissões para Corrigir
                </h3>
                {correcoesPaginadas.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ainda não há provas submetidas para correção.
                    </p>
                )}

                {correcoesPaginadas.map((submissao) => {
                    const pendentes = pendentesPorSubmissao(submissao);
                    const isActive = submissao.id === selectedId;

                    return (
                        <button
                            key={submissao.id}
                            type="button"
                            onClick={() => setSelectedId(submissao.id)}
                            className={`w-full text-left rounded-lg border p-3 transition-colors ${
                                isActive
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40"
                            }`}
                        >
                            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {submissao.teste?.titulo || "Teste"}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                                {submissao.aluno?.name || "Aluno"}
                            </p>
                            <div className="mt-2 flex items-center justify-between text-xs">
                                <TestStatusBadge
                                    status={getStatusCorrecao(submissao).label}
                                    tone={getStatusCorrecao(submissao).tone}
                                />
                                <span
                                    className={`font-bold ${pendentes > 0 ? "text-amber-600" : "text-emerald-600"}`}
                                >
                                    {pendentes > 0
                                        ? `${pendentes} pendente(s)`
                                        : "Corrigido"}
                                </span>
                            </div>
                        </button>
                    );
                })}

                {correcoesPaginadas.length > 0 && (
                    <div className="flex items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Página {paginaAtual} de {totalPaginas}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    mudarPagina(Math.max(1, paginaAtual - 1))
                                }
                                disabled={paginaAtual === 1}
                                className="px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Anterior
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    mudarPagina(
                                        Math.min(totalPaginas, paginaAtual + 1),
                                    )
                                }
                                disabled={paginaAtual === totalPaginas}
                                className="px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Seguinte
                            </button>
                        </div>
                    </div>
                )}
            </aside>

            <section className="xl:col-span-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5">
                {!selectedSubmissao && (
                    <div className="min-h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                        Seleciona uma submissão para começar a correção.
                    </div>
                )}

                {selectedSubmissao && (
                    <>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {selectedSubmissao.teste?.titulo}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    Aluno: {selectedSubmissao.aluno?.name} (
                                    {selectedSubmissao.aluno?.email})
                                </p>
                            </div>
                            <div className="flex flex-col items-start md:items-end gap-3">
                                <div className="text-sm space-y-1">
                                    <p className="font-semibold text-gray-700 dark:text-gray-200">
                                        Pontuação: {totalObtido} / {totalMaximo}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Nota atual:{" "}
                                        {selectedSubmissao.nota_final ?? "-"}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Corrigido por:{" "}
                                        {selectedSubmissao.corrigido_por
                                            ?.name || "-"}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Corrigido em:{" "}
                                        {formatDateTime(
                                            selectedSubmissao.corrigido_em,
                                        )}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Publicado em:{" "}
                                        {formatDateTime(
                                            selectedSubmissao.publicado_em,
                                        )}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedId(null)}
                                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[52vh] overflow-y-auto pr-1">
                            {(selectedSubmissao.respostas || []).map(
                                (resposta, index) => {
                                    const maxPergunta = Number(
                                        mapaPontuacoes.get(
                                            resposta.id_pergunta,
                                        ) || 1,
                                    );
                                    const respostaForm =
                                        correcaoForm.data.respostas?.[index] ||
                                        {};

                                    return (
                                        <div
                                            key={resposta.id}
                                            className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {resposta.pergunta
                                                            ?.texto ||
                                                            "Pergunta"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Tipo:{" "}
                                                        {formatTipoPergunta(
                                                            resposta.pergunta
                                                                ?.tipo_pergunta,
                                                        )}{" "}
                                                        | Máx: {maxPergunta}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 dark:bg-gray-700/40 rounded-md p-3 text-sm text-gray-700 dark:text-gray-200">
                                                <strong>
                                                    Resposta do aluno:
                                                </strong>{" "}
                                                {formatarRespostaAluno(
                                                    resposta,
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300">
                                                        Estado
                                                    </label>
                                                    <select
                                                        value={
                                                            respostaForm.status_correcao ||
                                                            "Por_Avaliar"
                                                        }
                                                        onChange={(e) =>
                                                            updateRespostaField(
                                                                index,
                                                                "status_correcao",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                                    >
                                                        <option value="Por_Avaliar">
                                                            Por Avaliar
                                                        </option>
                                                        <option value="Correto">
                                                            Correto
                                                        </option>
                                                        <option value="Errado">
                                                            Errado
                                                        </option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300">
                                                        Pontuação
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={maxPergunta}
                                                        value={
                                                            respostaForm.pontuacao_obtida ??
                                                            0
                                                        }
                                                        onChange={(e) =>
                                                            updateRespostaField(
                                                                index,
                                                                "pontuacao_obtida",
                                                                Math.min(
                                                                    maxPergunta,
                                                                    Math.max(
                                                                        0,
                                                                        Number(
                                                                            e
                                                                                .target
                                                                                .value ||
                                                                                0,
                                                                        ),
                                                                    ),
                                                                ),
                                                            )
                                                        }
                                                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                                    />
                                                </div>

                                                <div className="md:col-span-1">
                                                    <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300">
                                                        Comentário
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            respostaForm.comentario_formador ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            updateRespostaField(
                                                                index,
                                                                "comentario_formador",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                                        placeholder="Feedback para o aluno"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>

                        {correcaoForm.errors?.respostas && (
                            <p className="text-sm text-red-600">
                                {correcaoForm.errors.respostas}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                disabled={correcaoForm.processing}
                                onClick={() => submitCorrecao(false)}
                                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold"
                            >
                                Guardar Correção
                            </button>
                            <button
                                type="button"
                                disabled={correcaoForm.processing}
                                onClick={() => submitCorrecao(true)}
                                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                                Publicar Nota
                            </button>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
