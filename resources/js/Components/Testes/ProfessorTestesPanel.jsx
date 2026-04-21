import React, { useMemo, useState } from "react";
import { useForm } from "@inertiajs/react";

const TIPO_PERGUNTA_OPTIONS = [
    { value: "Dissertativa", label: "Desenvolvimento" },
    { value: "Escolha_Multipla", label: "Escolha Multipla" },
    { value: "Verdadeiro_Falso", label: "Verdadeiro ou Falso" },
];

const TIPO_AVALIACAO_OPTIONS = [
    { value: "Teste_Formal", label: "Teste Formal" },
    { value: "Ficha_Trabalho", label: "Ficha de Trabalho" },
    { value: "Exame_Final", label: "Exame Final" },
];

function NovaPerguntaInline({
    value,
    onChange,
    onRemove,
    title = "Nova pergunta",
}) {
    const update = (field, fieldValue) =>
        onChange({ ...value, [field]: fieldValue });

    const updateOpcao = (index, newValue) => {
        const next = [...(value.opcoes || ["", ""])];
        next[index] = newValue;
        update("opcoes", next);
    };

    const addOpcao = () => update("opcoes", [...(value.opcoes || []), ""]);

    const removeOpcao = (index) => {
        const next = (value.opcoes || []).filter((_, i) => i !== index);
        update("opcoes", next.length ? next : ["", ""]);
        if ((value.resposta_correta_index ?? 0) >= next.length) {
            update("resposta_correta_index", 0);
        }
    };

    return (
        <div className="border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 bg-indigo-50/40 dark:bg-indigo-900/20 space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h5 className="font-bold text-indigo-900 dark:text-indigo-200">
                    {title}
                </h5>
                {onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="px-3 py-1.5 rounded-md text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200"
                    >
                        Remover
                    </button>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Enunciado
                </label>
                <textarea
                    value={value.texto || ""}
                    onChange={(e) => update("texto", e.target.value)}
                    rows={3}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Escreve a pergunta..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de pergunta
                </label>
                <select
                    value={value.tipo_pergunta || "Dissertativa"}
                    onChange={(e) => update("tipo_pergunta", e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                    {TIPO_PERGUNTA_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {value.tipo_pergunta === "Escolha_Multipla" && (
                <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Opções
                    </p>
                    {(value.opcoes || []).map((op, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={op}
                                onChange={(e) =>
                                    updateOpcao(index, e.target.value)
                                }
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                placeholder={`Opção ${index + 1}`}
                            />
                            <button
                                type="button"
                                onClick={() => removeOpcao(index)}
                                className="px-2 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm"
                            >
                                X
                            </button>
                        </div>
                    ))}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={addOpcao}
                            className="px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200"
                        >
                            + Opção
                        </button>
                        <select
                            value={value.resposta_correta_index ?? 0}
                            onChange={(e) =>
                                update(
                                    "resposta_correta_index",
                                    Number(e.target.value),
                                )
                            }
                            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            {(value.opcoes || []).map((_, index) => (
                                <option key={index} value={index}>
                                    Correta: opção {index + 1}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {value.tipo_pergunta === "Verdadeiro_Falso" && (
                <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Resposta correta
                    </p>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input
                                type="radio"
                                checked={Boolean(
                                    value.resposta_verdadeiro_falso,
                                )}
                                onChange={() =>
                                    update("resposta_verdadeiro_falso", true)
                                }
                            />
                            Verdadeiro
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input
                                type="radio"
                                checked={
                                    !Boolean(value.resposta_verdadeiro_falso)
                                }
                                onChange={() =>
                                    update("resposta_verdadeiro_falso", false)
                                }
                            />
                            Falso
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ProfessorTestesPanel({
    perguntasProfessor = [],
    testesProfessor = [],
}) {
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [editingPerguntaId, setEditingPerguntaId] = useState(null);

    const perguntaForm = useForm({
        texto: "",
        tipo_pergunta: "Dissertativa",
        opcoes: ["", ""],
        resposta_correta_index: 0,
        resposta_verdadeiro_falso: true,
    });

    const testeForm = useForm({
        titulo: "",
        tipo_avaliacao: "Teste_Formal",
        data_hora_abertura: "",
        data_hora_fecho: "",
        duracao_minutos: "",
        pergunta_ids: [],
        novas_perguntas: [],
    });

    const perguntaEditForm = useForm({
        texto: "",
        tipo_pergunta: "Dissertativa",
        opcoes: ["", ""],
        resposta_correta_index: 0,
        resposta_verdadeiro_falso: true,
    });

    const perguntasDisponiveis = useMemo(
        () => perguntasProfessor || [],
        [perguntasProfessor],
    );

    const togglePerguntaSelecionada = (id) => {
        const current = testeForm.data.pergunta_ids || [];
        if (current.includes(id)) {
            testeForm.setData(
                "pergunta_ids",
                current.filter((item) => item !== id),
            );
            return;
        }
        testeForm.setData("pergunta_ids", [...current, id]);
    };

    const submitPergunta = (e) => {
        e.preventDefault();
        perguntaForm.post(route("professor.perguntas.store"), {
            preserveScroll: true,
            onSuccess: () => {
                perguntaForm.reset();
                perguntaForm.setData("opcoes", ["", ""]);
                perguntaForm.setData("resposta_correta_index", 0);
                perguntaForm.setData("resposta_verdadeiro_falso", true);
                setShowQuestionForm(false);
            },
        });
    };

    const carregarPerguntaNoEditor = (pergunta) => {
        const opcoes = (pergunta.opcoes || []).map((o) => o.texto_opcao);
        const indiceCorreto = (pergunta.opcoes || []).findIndex(
            (o) => o.is_correct,
        );
        const opcaoVerdadeiro = (pergunta.opcoes || []).find(
            (o) => o.texto_opcao === "Verdadeiro",
        );

        perguntaEditForm.setData({
            texto: pergunta.texto || "",
            tipo_pergunta: pergunta.tipo_pergunta || "Dissertativa",
            opcoes: opcoes.length > 0 ? opcoes : ["", ""],
            resposta_correta_index: indiceCorreto >= 0 ? indiceCorreto : 0,
            resposta_verdadeiro_falso: opcaoVerdadeiro
                ? Boolean(opcaoVerdadeiro.is_correct)
                : true,
        });

        setEditingPerguntaId(pergunta.id);
        setShowQuestionForm(false);
    };

    const cancelarEdicaoPergunta = () => {
        setEditingPerguntaId(null);
        perguntaEditForm.reset();
        perguntaEditForm.setData("opcoes", ["", ""]);
        perguntaEditForm.setData("resposta_correta_index", 0);
        perguntaEditForm.setData("resposta_verdadeiro_falso", true);
    };

    const submitPerguntaEdicao = (e) => {
        e.preventDefault();
        if (!editingPerguntaId) return;

        perguntaEditForm.put(
            route("professor.perguntas.update", editingPerguntaId),
            {
                preserveScroll: true,
                onSuccess: () => {
                    cancelarEdicaoPergunta();
                },
            },
        );
    };

    const adicionarNovaPerguntaNoTeste = () => {
        testeForm.setData("novas_perguntas", [
            ...(testeForm.data.novas_perguntas || []),
            {
                texto: "",
                tipo_pergunta: "Dissertativa",
                opcoes: ["", ""],
                resposta_correta_index: 0,
                resposta_verdadeiro_falso: true,
            },
        ]);
    };

    const atualizarNovaPerguntaNoTeste = (index, updatedQuestion) => {
        const next = [...(testeForm.data.novas_perguntas || [])];
        next[index] = updatedQuestion;
        testeForm.setData("novas_perguntas", next);
    };

    const removerNovaPerguntaNoTeste = (index) => {
        const next = (testeForm.data.novas_perguntas || []).filter(
            (_, i) => i !== index,
        );
        testeForm.setData("novas_perguntas", next);
    };

    const submitTeste = (e) => {
        e.preventDefault();
        testeForm.post(route("professor.testes.store"), {
            preserveScroll: true,
            onSuccess: () => {
                testeForm.reset();
                testeForm.setData("pergunta_ids", []);
                testeForm.setData("novas_perguntas", []);
            },
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Banco de Perguntas
                        </h3>
                        <button
                            type="button"
                            onClick={() => setShowQuestionForm((s) => !s)}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                        >
                            {showQuestionForm ? "Fechar" : "Nova Pergunta"}
                        </button>
                    </div>

                    {showQuestionForm && (
                        <form onSubmit={submitPergunta} className="space-y-4">
                            <NovaPerguntaInline
                                value={perguntaForm.data}
                                onChange={(value) =>
                                    perguntaForm.setData(value)
                                }
                                title="Criar pergunta"
                            />
                            <button
                                type="submit"
                                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                disabled={perguntaForm.processing}
                            >
                                Guardar Pergunta
                            </button>
                            {Object.values(perguntaForm.errors || {}).length >
                                0 && (
                                <p className="text-sm text-red-600">
                                    Não foi possível guardar a pergunta.
                                    Verifica os campos.
                                </p>
                            )}
                        </form>
                    )}

                    {editingPerguntaId && (
                        <form
                            onSubmit={submitPerguntaEdicao}
                            className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4"
                        >
                            <NovaPerguntaInline
                                value={perguntaEditForm.data}
                                onChange={(value) =>
                                    perguntaEditForm.setData(value)
                                }
                                title="Editar pergunta"
                            />
                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                                    disabled={perguntaEditForm.processing}
                                >
                                    Guardar Alterações
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelarEdicaoPergunta}
                                    className="px-4 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
                                >
                                    Cancelar
                                </button>
                            </div>
                            {Object.values(perguntaEditForm.errors || {})
                                .length > 0 && (
                                <p className="text-sm text-red-600">
                                    Não foi possível atualizar a pergunta.
                                    Verifica os campos.
                                </p>
                            )}
                        </form>
                    )}

                    <div className="space-y-3 max-h-[26rem] overflow-y-auto pr-1">
                        {perguntasDisponiveis.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Ainda não tens perguntas criadas.
                            </p>
                        )}
                        {perguntasDisponiveis.map((pergunta) => (
                            <div
                                key={pergunta.id}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                            >
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                    {pergunta.texto}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Tipo:{" "}
                                    {pergunta.tipo_pergunta.replaceAll(
                                        "_",
                                        " ",
                                    )}
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            carregarPerguntaNoEditor(pergunta)
                                        }
                                        className="px-3 py-1.5 rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200 text-xs font-semibold"
                                    >
                                        Editar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <form
                    onSubmit={submitTeste}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5"
                >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Criar Teste
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Título
                            </label>
                            <input
                                type="text"
                                value={testeForm.data.titulo}
                                onChange={(e) =>
                                    testeForm.setData("titulo", e.target.value)
                                }
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                placeholder="Ex: Teste de Programação - Módulo 1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tipo de avaliação
                            </label>
                            <select
                                value={testeForm.data.tipo_avaliacao}
                                onChange={(e) =>
                                    testeForm.setData(
                                        "tipo_avaliacao",
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            >
                                {TIPO_AVALIACAO_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Duração (minutos)
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={testeForm.data.duracao_minutos}
                                onChange={(e) =>
                                    testeForm.setData(
                                        "duracao_minutos",
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                placeholder="Opcional"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Abertura
                            </label>
                            <input
                                type="datetime-local"
                                value={testeForm.data.data_hora_abertura}
                                onChange={(e) =>
                                    testeForm.setData(
                                        "data_hora_abertura",
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fecho
                            </label>
                            <input
                                type="datetime-local"
                                value={testeForm.data.data_hora_fecho}
                                onChange={(e) =>
                                    testeForm.setData(
                                        "data_hora_fecho",
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100">
                                Selecionar perguntas existentes
                            </h4>
                            <span className="text-xs text-gray-500">
                                Selecionadas:{" "}
                                {(testeForm.data.pergunta_ids || []).length}
                            </span>
                        </div>
                        <div className="max-h-44 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                            {perguntasDisponiveis.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    Sem perguntas criadas.
                                </p>
                            )}
                            {perguntasDisponiveis.map((pergunta) => (
                                <label
                                    key={pergunta.id}
                                    className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                                >
                                    <input
                                        type="checkbox"
                                        checked={(
                                            testeForm.data.pergunta_ids || []
                                        ).includes(pergunta.id)}
                                        onChange={() =>
                                            togglePerguntaSelecionada(
                                                pergunta.id,
                                            )
                                        }
                                        className="mt-1"
                                    />
                                    <span>
                                        <strong className="font-semibold">
                                            {pergunta.tipo_pergunta.replaceAll(
                                                "_",
                                                " ",
                                            )}
                                        </strong>
                                        <br />
                                        {pergunta.texto}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100">
                                Criar novas perguntas dentro do teste
                            </h4>
                            <button
                                type="button"
                                onClick={adicionarNovaPerguntaNoTeste}
                                className="px-3 py-1.5 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-semibold"
                            >
                                + Adicionar
                            </button>
                        </div>

                        {(testeForm.data.novas_perguntas || []).map(
                            (pergunta, index) => (
                                <NovaPerguntaInline
                                    key={index}
                                    value={pergunta}
                                    onChange={(updatedQuestion) =>
                                        atualizarNovaPerguntaNoTeste(
                                            index,
                                            updatedQuestion,
                                        )
                                    }
                                    onRemove={() =>
                                        removerNovaPerguntaNoTeste(index)
                                    }
                                    title={`Nova pergunta #${index + 1}`}
                                />
                            ),
                        )}
                    </div>

                    <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold"
                        disabled={testeForm.processing}
                    >
                        Guardar Teste
                    </button>
                    {Object.values(testeForm.errors || {}).length > 0 && (
                        <p className="text-sm text-red-600">
                            Não foi possível criar o teste. Verifica os dados
                            preenchidos.
                        </p>
                    )}
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Testes Criados
                </h3>
                <div className="space-y-3">
                    {testesProfessor.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ainda não criaste nenhum teste.
                        </p>
                    )}
                    {testesProfessor.map((teste) => (
                        <div
                            key={teste.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                        >
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                                {teste.titulo}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {teste.tipo_avaliacao.replaceAll("_", " ")} |{" "}
                                {teste.perguntas?.length || 0} perguntas
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
