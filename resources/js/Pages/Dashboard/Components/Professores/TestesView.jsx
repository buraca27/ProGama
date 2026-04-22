// resources/js/Pages/Dashboard/Components/Professores/TestesView.jsx

import React, { useMemo, useState } from "react";
import { useForm } from "@inertiajs/react";

// =============================================================================
// CONSTANTES
// =============================================================================
const TIPO_PERGUNTA_OPTIONS = [
    { value: "Dissertativa", label: "Desenvolvimento" },
    { value: "Escolha_Multipla", label: "Escolha Múltipla" },
    { value: "Verdadeiro_Falso", label: "Verdadeiro ou Falso" },
];

const TIPO_AVALIACAO_OPTIONS = [
    { value: "Teste_Formal", label: "Teste Formal" },
    { value: "Ficha_Trabalho", label: "Ficha de Trabalho" },
    { value: "Exame_Final", label: "Exame Final" },
];

// =============================================================================
// SUB-COMPONENTE: Formulário inline de pergunta
// =============================================================================
function NovaPerguntaInline({
    value,
    onChange,
    onRemove,
    onMoveUp,
    onMoveDown,
    title = "Nova pergunta",
    categorias = [],
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

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result;
            update("url_anexo_pergunta", base64);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 bg-indigo-50/40 dark:bg-indigo-900/20 space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h5 className="font-bold text-indigo-900 dark:text-indigo-200">
                    {title}
                </h5>
                <div className="flex items-center gap-2">
                    {onMoveUp && (
                        <button
                            type="button"
                            onClick={onMoveUp}
                            className="px-2 py-1.5 rounded-md text-sm font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200"
                            title="Mover para cima"
                        >
                            ↑
                        </button>
                    )}
                    {onMoveDown && (
                        <button
                            type="button"
                            onClick={onMoveDown}
                            className="px-2 py-1.5 rounded-md text-sm font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200"
                            title="Mover para baixo"
                        >
                            ↓
                        </button>
                    )}
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
            </div>

            {/* Enunciado */}
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

            {/* Pontuação */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pontuação da pergunta
                </label>
                <input
                    type="number"
                    min="1"
                    max="20"
                    value={value.pontuacao || 1}
                    onChange={(e) => {
                        const val = Math.min(
                            20,
                            Math.max(1, Number(e.target.value)),
                        );
                        update("pontuacao", val);
                    }}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoria
                </label>
                <select
                    value={value.id_categoria || ""}
                    onChange={(e) =>
                        update("id_categoria", Number(e.target.value))
                    }
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    required
                >
                    <option value="">Seleciona uma categoria...</option>
                    {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nome}
                        </option>
                    ))}
                </select>
            </div>

            {/* Foto / Anexo */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Foto / Anexo (opcional)
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-700 dark:text-gray-300 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                    />
                    {value.url_anexo_pergunta && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                            ✓ Foto adicionada
                        </span>
                    )}
                </div>
            </div>

            {/* Tipo de pergunta */}
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

            {/* Opções de escolha múltipla */}
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
                                ✕
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

            {/* Verdadeiro / Falso */}
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

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================
export default function TestesView({
    perguntasProfessor = [],
    testesProfessor = [],
    categorias = [],
}) {
    const [activeSection, setActiveSection] = useState("banco");
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [editingPerguntaId, setEditingPerguntaId] = useState(null);
    const [editingTesteId, setEditingTesteId] = useState(null);
    const [categoriaFiltro, setCategoriaFiltro] = useState("");
    const [mostrarListaPerguntas, setMostrarListaPerguntas] = useState(true);

    // --- Formulários Inertia ---
    const perguntaForm = useForm({
        texto: "",
        tipo_pergunta: "Dissertativa",
        id_categoria: "",
        url_anexo_pergunta: null,
        opcoes: ["", ""],
        resposta_correta_index: 0,
        resposta_verdadeiro_falso: true,
    });

    const perguntaEditForm = useForm({
        texto: "",
        tipo_pergunta: "Dissertativa",
        id_categoria: "",
        url_anexo_pergunta: null,
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
        pontuacao_por_pergunta: {},
        novas_perguntas: [],
    });

    const perguntasDisponiveis = useMemo(
        () => perguntasProfessor || [],
        [perguntasProfessor],
    );

    const toDatetimeLocal = (value) => {
        if (!value) return "";
        const normalized = String(value).replace(" ", "T");
        return normalized.slice(0, 16);
    };

    // --- Handlers perguntas do banco ---
    const togglePerguntaSelecionada = (id) => {
        const current = testeForm.data.pergunta_ids || [];
        const isSelected = current.includes(id);

        testeForm.setData(
            "pergunta_ids",
            isSelected
                ? current.filter((item) => item !== id)
                : [...current, id],
        );

        const pontuacoes = { ...(testeForm.data.pontuacao_por_pergunta || {}) };
        if (isSelected) {
            delete pontuacoes[id];
        } else if (!pontuacoes[id]) {
            pontuacoes[id] = 1;
        }

        testeForm.setData("pontuacao_por_pergunta", pontuacoes);
    };

    const atualizarPontuacaoPerguntaExistente = (id, value) => {
        const numero = Number(value);
        const pontuacao = Number.isNaN(numero)
            ? 1
            : Math.min(20, Math.max(1, numero));

        testeForm.setData("pontuacao_por_pergunta", {
            ...(testeForm.data.pontuacao_por_pergunta || {}),
            [id]: pontuacao,
        });
    };

    const moverPerguntaSelecionadaParaCima = (index) => {
        if (index <= 0) return;
        const ids = [...(testeForm.data.pergunta_ids || [])];
        [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
        testeForm.setData("pergunta_ids", ids);
    };

    const moverPerguntaSelecionadaParaBaixo = (index) => {
        const ids = testeForm.data.pergunta_ids || [];
        if (index >= ids.length - 1) return;
        const next = [...ids];
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
        testeForm.setData("pergunta_ids", next);
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
                perguntaForm.setData("id_categoria", "");
                perguntaForm.setData("url_anexo_pergunta", null);
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
            id_categoria: pergunta.id_categoria || "",
            url_anexo_pergunta: pergunta.url_anexo_pergunta || null,
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
        perguntaEditForm.setData("id_categoria", "");
        perguntaEditForm.setData("url_anexo_pergunta", null);
    };

    const submitPerguntaEdicao = (e) => {
        e.preventDefault();
        if (!editingPerguntaId) return;
        perguntaEditForm.put(
            route("professor.perguntas.update", editingPerguntaId),
            {
                preserveScroll: true,
                onSuccess: () => cancelarEdicaoPergunta(),
            },
        );
    };

    // --- Handlers perguntas inline do teste ---
    const adicionarNovaPerguntaNoTeste = () => {
        testeForm.setData("novas_perguntas", [
            ...(testeForm.data.novas_perguntas || []),
            {
                texto: "",
                tipo_pergunta: "Dissertativa",
                id_categoria: "",
                url_anexo_pergunta: null,
                pontuacao: 1,
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
        testeForm.setData(
            "novas_perguntas",
            (testeForm.data.novas_perguntas || []).filter(
                (_, i) => i !== index,
            ),
        );
    };

    const moverNovaPerguntaParaCima = (index) => {
        if (index <= 0) return;
        const novas = [...(testeForm.data.novas_perguntas || [])];
        [novas[index - 1], novas[index]] = [novas[index], novas[index - 1]];
        testeForm.setData("novas_perguntas", novas);
    };

    const moverNovaPerguntaParaBaixo = (index) => {
        const novas = testeForm.data.novas_perguntas || [];
        if (index >= novas.length - 1) return;
        const next = [...novas];
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
        testeForm.setData("novas_perguntas", next);
    };

    const calcularTotalPontuacaoTeste = () => {
        const totalExistentes = (testeForm.data.pergunta_ids || []).reduce(
            (acc, id) =>
                acc + Number(testeForm.data.pontuacao_por_pergunta?.[id] || 1),
            0,
        );

        const totalNovas = (testeForm.data.novas_perguntas || []).reduce(
            (acc, pergunta) => acc + Number(pergunta.pontuacao || 1),
            0,
        );

        return totalExistentes + totalNovas;
    };

    const totalPontuacaoTeste = calcularTotalPontuacaoTeste();
    const excedePontuacaoMaxima = totalPontuacaoTeste > 20;

    const submitTeste = (e) => {
        e.preventDefault();

        if (excedePontuacaoMaxima) {
            testeForm.setError(
                "total_pontuacao",
                "A soma da pontuação das perguntas não pode ultrapassar 20. Ajusta os valores antes de guardar.",
            );
            return;
        }

        testeForm.clearErrors("total_pontuacao");

        const onSuccess = () => {
            testeForm.reset();
            testeForm.setData("pergunta_ids", []);
            testeForm.setData("pontuacao_por_pergunta", {});
            testeForm.setData("novas_perguntas", []);
            setEditingTesteId(null);
        };

        if (editingTesteId) {
            testeForm.put(route("professor.testes.update", editingTesteId), {
                preserveScroll: true,
                onSuccess,
            });
            return;
        }

        testeForm.post(route("professor.testes.store"), {
            preserveScroll: true,
            onSuccess,
        });
    };

    const carregarTesteNoEditor = (teste) => {
        testeForm.setData({
            titulo: teste.titulo || "",
            tipo_avaliacao: teste.tipo_avaliacao || "Teste_Formal",
            data_hora_abertura: toDatetimeLocal(teste.data_hora_abertura),
            data_hora_fecho: toDatetimeLocal(teste.data_hora_fecho),
            duracao_minutos: teste.duracao_minutos ?? "",
            pergunta_ids: (teste.perguntas || []).map((p) => p.id),
            pontuacao_por_pergunta: (teste.perguntas || []).reduce(
                (acc, p) => ({ ...acc, [p.id]: p.pivot?.valor_pontuacao ?? 1 }),
                {},
            ),
            novas_perguntas: [],
        });

        setEditingTesteId(teste.id);
        setActiveSection("criar");
    };

    const cancelarEdicaoTeste = () => {
        setEditingTesteId(null);
        testeForm.reset();
        testeForm.setData("pergunta_ids", []);
        testeForm.setData("pontuacao_por_pergunta", {});
        testeForm.setData("novas_perguntas", []);
        setCategoriaFiltro("");
    };

    // =============================================================================
    // RENDER
    // =============================================================================
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-2">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveSection("banco")}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                            activeSection === "banco"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                        Banco de Perguntas
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection("criar")}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                            activeSection === "criar"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                        Criar Teste
                    </button>
                </div>
            </div>

            {/* ----------------------------------------------------------------
                GRID PRINCIPAL: Banco de perguntas + Criar teste
            ---------------------------------------------------------------- */}
            <div className="grid grid-cols-1 gap-6">
                {/* ---- Banco de Perguntas ---- */}
                {activeSection === "banco" && (
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

                        {/* Form: nova pergunta */}
                        {showQuestionForm && (
                            <form
                                onSubmit={submitPergunta}
                                className="space-y-4"
                            >
                                <NovaPerguntaInline
                                    value={perguntaForm.data}
                                    onChange={(value) =>
                                        perguntaForm.setData(value)
                                    }
                                    title="Criar pergunta"
                                    categorias={categorias}
                                />
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                    disabled={perguntaForm.processing}
                                >
                                    Guardar Pergunta
                                </button>
                                {Object.values(perguntaForm.errors || {})
                                    .length > 0 && (
                                    <p className="text-sm text-red-600">
                                        Não foi possível guardar a pergunta.
                                        Verifica os campos.
                                    </p>
                                )}
                            </form>
                        )}

                        {/* Form: editar pergunta */}
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
                                    categorias={categorias}
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

                        {/* Lista de perguntas existentes */}
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
                                    <div className="mt-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                carregarPerguntaNoEditor(
                                                    pergunta,
                                                )
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
                )}

                {/* ---- Criar Teste ---- */}
                {activeSection === "criar" && (
                    <form
                        onSubmit={submitTeste}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5"
                    >
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {editingTesteId ? "Editar Teste" : "Criar Teste"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Título */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Título
                                </label>
                                <input
                                    type="text"
                                    value={testeForm.data.titulo}
                                    onChange={(e) =>
                                        testeForm.setData(
                                            "titulo",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    placeholder="Ex: Teste de Programação - Módulo 1"
                                    required
                                />
                            </div>

                            {/* Tipo de avaliação */}
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
                                        <option
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Duração */}
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

                            {/* Abertura */}
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

                            {/* Fecho */}
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

                        {/* Filtro por categoria */}
                        {mostrarListaPerguntas && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Filtrar por categoria
                                </label>
                                <select
                                    value={categoriaFiltro}
                                    onChange={(e) =>
                                        setCategoriaFiltro(e.target.value)
                                    }
                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="">
                                        Todas as categorias
                                    </option>
                                    {categorias.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Selecionar perguntas existentes */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-gray-900 dark:text-gray-100">
                                    Selecionar perguntas existentes
                                </h4>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500">
                                        Selecionadas:{" "}
                                        {
                                            (testeForm.data.pergunta_ids || [])
                                                .length
                                        }
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMostrarListaPerguntas(
                                                (estado) => !estado,
                                            )
                                        }
                                        className="px-3 py-1 rounded-md text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                                    >
                                        {mostrarListaPerguntas
                                            ? "Esconder Lista"
                                            : "Mostrar Lista"}
                                    </button>
                                </div>
                            </div>
                            {mostrarListaPerguntas && (
                                <div className="max-h-44 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                                    {perguntasDisponiveis.filter(
                                        (p) =>
                                            !categoriaFiltro ||
                                            p.id_categoria ===
                                                Number(categoriaFiltro),
                                    ).length === 0 && (
                                        <p className="text-sm text-gray-500">
                                            Sem perguntas nesta categoria.
                                        </p>
                                    )}
                                    {perguntasDisponiveis
                                        .filter(
                                            (p) =>
                                                !categoriaFiltro ||
                                                p.id_categoria ===
                                                    Number(categoriaFiltro),
                                        )
                                        .map((pergunta) => (
                                            <div
                                                key={pergunta.id}
                                                className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={(
                                                        testeForm.data
                                                            .pergunta_ids || []
                                                    ).includes(pergunta.id)}
                                                    onChange={() =>
                                                        togglePerguntaSelecionada(
                                                            pergunta.id,
                                                        )
                                                    }
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <span className="cursor-pointer">
                                                        <strong className="font-semibold">
                                                            {pergunta.tipo_pergunta.replaceAll(
                                                                "_",
                                                                " ",
                                                            )}
                                                        </strong>
                                                        <br />
                                                        {pergunta.texto}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

                        {/* Ordem das perguntas existentes selecionadas */}
                        {(testeForm.data.pergunta_ids || []).length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-900 dark:text-gray-100">
                                    Ordem das perguntas selecionadas
                                </h4>
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                                    {(testeForm.data.pergunta_ids || []).map(
                                        (perguntaId, index) => {
                                            const pergunta =
                                                perguntasDisponiveis.find(
                                                    (p) => p.id === perguntaId,
                                                );
                                            if (!pergunta) return null;

                                            return (
                                                <div
                                                    key={perguntaId}
                                                    className="flex items-center justify-between gap-3 rounded-md bg-gray-50 dark:bg-gray-900 px-3 py-2"
                                                >
                                                    <div className="flex-1">
                                                        <span className="text-sm text-gray-800 dark:text-gray-200">
                                                            {index + 1}.{" "}
                                                            {pergunta.texto}
                                                        </span>
                                                        <div className="mt-2 max-w-[190px]">
                                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                                                Pontuação
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="20"
                                                                value={
                                                                    testeForm
                                                                        .data
                                                                        .pontuacao_por_pergunta?.[
                                                                        pergunta
                                                                            .id
                                                                    ] ?? 1
                                                                }
                                                                onChange={(e) =>
                                                                    atualizarPontuacaoPerguntaExistente(
                                                                        pergunta.id,
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 self-start">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                moverPerguntaSelecionadaParaCima(
                                                                    index,
                                                                )
                                                            }
                                                            disabled={
                                                                index === 0
                                                            }
                                                            className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 disabled:opacity-40"
                                                        >
                                                            ↑
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                moverPerguntaSelecionadaParaBaixo(
                                                                    index,
                                                                )
                                                            }
                                                            disabled={
                                                                index ===
                                                                (
                                                                    testeForm
                                                                        .data
                                                                        .pergunta_ids ||
                                                                    []
                                                                ).length -
                                                                    1
                                                            }
                                                            className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 disabled:opacity-40"
                                                        >
                                                            ↓
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Criar novas perguntas inline */}
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
                                        onMoveUp={
                                            index > 0
                                                ? () =>
                                                      moverNovaPerguntaParaCima(
                                                          index,
                                                      )
                                                : undefined
                                        }
                                        onMoveDown={
                                            index <
                                            (
                                                testeForm.data
                                                    .novas_perguntas || []
                                            ).length -
                                                1
                                                ? () =>
                                                      moverNovaPerguntaParaBaixo(
                                                          index,
                                                      )
                                                : undefined
                                        }
                                        title={`Nova pergunta #${index + 1}`}
                                        categorias={categorias}
                                    />
                                ),
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold"
                                disabled={testeForm.processing}
                            >
                                {editingTesteId
                                    ? "Guardar Alterações"
                                    : "Guardar Teste"}
                            </button>
                            {editingTesteId && (
                                <button
                                    type="button"
                                    onClick={cancelarEdicaoTeste}
                                    className="px-5 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
                                >
                                    Cancelar Edição
                                </button>
                            )}
                        </div>
                        <div
                            className={`text-sm font-semibold ${
                                excedePontuacaoMaxima
                                    ? "text-red-600"
                                    : "text-emerald-600"
                            }`}
                        >
                            Pontuação total do teste: {totalPontuacaoTeste}/20
                        </div>
                        {testeForm.errors.total_pontuacao && (
                            <p className="text-sm text-red-600">
                                {testeForm.errors.total_pontuacao}
                            </p>
                        )}
                        {Object.values(testeForm.errors || {}).length > 0 && (
                            <p className="text-sm text-red-600">
                                Não foi possível guardar o teste. Verifica os
                                dados preenchidos.
                            </p>
                        )}
                    </form>
                )}
            </div>

            {/* ----------------------------------------------------------------
                LISTA DE TESTES CRIADOS
            ---------------------------------------------------------------- */}
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
                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={() => carregarTesteNoEditor(teste)}
                                    className="px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-semibold"
                                >
                                    Editar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
