import React, { useState, useEffect, useRef } from "react";
import { useForm, router } from "@inertiajs/react";
import NovaPerguntaInline from "./NovaPerguntaInline";
import { TIPO_DESAFIO_OPTIONS } from "./constants";
import { CONTEXTO_AVALIACAO } from "./constants";

function CamposBadge({ form, raridadeInfo }) {
    const [preview, setPreview] = useState(null);
    const prevFile = useRef(null);

    useEffect(() => {
        if (form.data.imagem === prevFile.current) return;
        prevFile.current = form.data.imagem;
        if (preview) URL.revokeObjectURL(preview);
        if (!form.data.imagem) { setPreview(null); return; }
        const url = URL.createObjectURL(form.data.imagem);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [form.data.imagem]);

    return (
        <div className="space-y-2">
            <div>
                <input
                    type="text"
                    value={form.data.nome}
                    onChange={(e) => form.setData("nome", e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                    placeholder="Nome da badge *"
                    required
                />
                {form.errors.nome && <p className="text-xs text-red-600 mt-0.5">{form.errors.nome}</p>}
            </div>
            <textarea
                rows="2"
                value={form.data.descricao}
                onChange={(e) => form.setData("descricao", e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                placeholder="Descrição (opcional)"
            />
            <div className="flex items-center gap-2">
                <select
                    value={form.data.raridade}
                    onChange={(e) => form.setData("raridade", e.target.value)}
                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                >
                    <option value="1">Bronze</option>
                    <option value="2">Prata</option>
                    <option value="3">Ouro</option>
                    <option value="4">Lendária</option>
                </select>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${raridadeInfo[form.data.raridade]?.classes}`}>
                    {raridadeInfo[form.data.raridade]?.label}
                </span>
            </div>
            <div className="flex items-center gap-3">
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => form.setData("imagem", e.target.files?.[0] || null)}
                    className="flex-1 text-sm text-gray-600 dark:text-gray-300"
                />
                {preview && <img src={preview} alt="preview" className="h-9 w-9 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 shrink-0" />}
            </div>
            {form.errors.imagem && <p className="text-xs text-red-600">{form.errors.imagem}</p>}
        </div>
    );
}

function GerirBadgesModal({ raridadeInfo, badgesProfessor, onClose }) {
    const [modoEdicaoId, setModoEdicaoId] = useState(null);
    const [mostrarFormCriacao, setMostrarFormCriacao] = useState(false);
    const [badgeParaEliminar, setBadgeParaEliminar] = useState(null);

    const criarForm = useForm({ nome: "", descricao: "", raridade: "1", imagem: null });
    const editarForm = useForm({ nome: "", descricao: "", raridade: "1", imagem: null });

    const iniciarEdicao = (badge) => {
        setModoEdicaoId(badge.id);
        setMostrarFormCriacao(false);
        editarForm.setData({ nome: badge.nome, descricao: badge.descricao || "", raridade: String(badge.raridade), imagem: null });
    };

    const submeterEdicao = (e, badgeId) => {
        e.preventDefault();
        editarForm.transform((data) => ({ ...data, _method: "PUT" }));
        editarForm.post(route("professor.badges.update", badgeId), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { setModoEdicaoId(null); editarForm.reset(); editarForm.transform((d) => d); },
            onFinish: () => editarForm.transform((d) => d),
        });
    };

    const submeterCriacao = (e) => {
        e.preventDefault();
        criarForm.post(route("professor.badges.store"), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { criarForm.reset(); setMostrarFormCriacao(false); },
        });
    };

    const confirmarEliminar = () => {
        router.delete(route("professor.badges.destroy", badgeParaEliminar.id), {
            preserveScroll: true,
            onSuccess: () => setBadgeParaEliminar(null),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 shadow-xl flex flex-col max-h-[90vh]">

                {/* Cabeçalho */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Gerir Badges</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">✕</button>
                </div>

                {/* Lista de badges */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                    {badgesProfessor.length === 0 && (
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Sem badges criadas ainda.</p>
                    )}
                    {badgesProfessor.map((badge) => (
                        <div key={badge.id}>
                            {modoEdicaoId === badge.id ? (
                                <form
                                    onSubmit={(e) => submeterEdicao(e, badge.id)}
                                    className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-3 space-y-2"
                                >
                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">A editar: {badge.nome}</p>
                                    <CamposBadge form={editarForm} raridadeInfo={raridadeInfo} />
                                    {Object.keys(editarForm.errors).length > 0 && (
                                        <p className="text-xs text-red-600">{Object.values(editarForm.errors)[0]}</p>
                                    )}
                                    <div className="flex gap-2 justify-end">
                                        <button type="button" onClick={() => setModoEdicaoId(null)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">Cancelar</button>
                                        <button type="submit" disabled={editarForm.processing} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60">
                                            {editarForm.processing ? "A guardar..." : "Guardar"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
                                    {badge.imagem_url
                                        ? <img src={`/storage/${badge.imagem_url}`} alt={badge.nome} className="h-8 w-8 rounded-full object-cover shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                                        : <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 shrink-0 flex items-center justify-center text-sm">🏅</div>
                                    }
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{badge.nome}</p>
                                        {badge.descricao && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{badge.descricao}</p>}
                                    </div>
                                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${raridadeInfo[badge.raridade]?.classes}`}>
                                        {raridadeInfo[badge.raridade]?.label}
                                    </span>
                                    <button type="button" onClick={() => iniciarEdicao(badge)} className="shrink-0 px-2 py-1 rounded text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400">
                                        Editar
                                    </button>
                                    <button type="button" onClick={() => setBadgeParaEliminar(badge)} className="shrink-0 px-2 py-1 rounded text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400">
                                        Eliminar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Criar nova badge */}
                <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 space-y-3 shrink-0">
                    <button
                        type="button"
                        onClick={() => { setMostrarFormCriacao((v) => !v); setModoEdicaoId(null); }}
                        className="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 transition"
                    >
                        {mostrarFormCriacao ? "Cancelar criação" : "+ Nova Badge"}
                    </button>
                    {mostrarFormCriacao && (
                        <form onSubmit={submeterCriacao} className="space-y-2">
                            <CamposBadge form={criarForm} raridadeInfo={raridadeInfo} />
                            {Object.keys(criarForm.errors).length > 0 && (
                                <p className="text-xs text-red-600">{Object.values(criarForm.errors)[0]}</p>
                            )}
                            <button type="submit" disabled={criarForm.processing} className="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60 transition">
                                {criarForm.processing ? "A criar..." : "Criar Badge"}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Confirmação de eliminação */}
            {badgeParaEliminar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl space-y-4">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            Eliminar <strong>"{badgeParaEliminar.nome}"</strong>?
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Se já foi atribuída a alunos, será desactivada em vez de eliminada permanentemente.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button type="button" onClick={() => setBadgeParaEliminar(null)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">Cancelar</button>
                            <button type="button" onClick={confirmarEliminar} className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function BadgeEntrada({ entrada, index, badgesProfessor, raridadeInfo, onChange, onRemove }) {
    const badgeSelecionada = entrada.badge_id
        ? (badgesProfessor || []).find((b) => String(b.id) === String(entrada.badge_id))
        : null;
    const raridade = badgeSelecionada ? raridadeInfo[badgeSelecionada.raridade] : null;

    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                    {/* Selecionar badge */}
                    <div className="flex items-center gap-2">
                        <select
                            value={entrada.badge_id || ""}
                            onChange={(e) => onChange(index, "badge_id", e.target.value)}
                            className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm"
                        >
                            <option value="">— Selecionar badge —</option>
                            {(badgesProfessor || []).map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.nome} ({raridadeInfo[b.raridade]?.label ?? "?"})
                                </option>
                            ))}
                        </select>
                        {raridade && (
                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${raridade.classes}`}>
                                {raridade.label}
                            </span>
                        )}
                    </div>

                    {/* Critério de atribuição */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 shrink-0">Atribuir:</label>
                        <label className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input
                                type="radio"
                                name={`criterio-${index}`}
                                value="conclusao"
                                checked={entrada.criterio === "conclusao"}
                                onChange={() => onChange(index, "criterio", "conclusao")}
                            />
                            Só por concluir
                        </label>
                        <label className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input
                                type="radio"
                                name={`criterio-${index}`}
                                value="nota_intervalo"
                                checked={entrada.criterio === "nota_intervalo"}
                                onChange={() => onChange(index, "criterio", "nota_intervalo")}
                            />
                            Por intervalo de nota
                        </label>
                        {entrada.criterio === "nota_intervalo" && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0" max="20" step="0.1"
                                    value={entrada.nota_minima ?? ""}
                                    onChange={(e) => onChange(index, "nota_minima", e.target.value)}
                                    className="w-20 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm"
                                    placeholder="Min"
                                />
                                <span className="text-gray-500 dark:text-gray-400 text-xs">até</span>
                                <input
                                    type="number"
                                    min="0" max="20" step="0.1"
                                    value={entrada.nota_maxima ?? ""}
                                    onChange={(e) => onChange(index, "nota_maxima", e.target.value)}
                                    className="w-20 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm"
                                    placeholder="Max"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="shrink-0 px-2 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 text-xs font-semibold"
                >
                    Remover
                </button>
            </div>
        </div>
    );
}

export default function CriarTesteSection({
    editingTesteId,
    submitTeste,
    testeForm,
    categorias,
    badgesProfessor = [],
    categoriaFiltro,
    setCategoriaFiltro,
    textoPerguntaFiltro,
    setTextoPerguntaFiltro,
    mostrarApenasMinhasPerguntas,
    setMostrarApenasMinhasPerguntas,
    mostrarListaPerguntas,
    setMostrarListaPerguntas,
    perguntasFiltradas,
    togglePerguntaSelecionada,
    perguntasDisponiveis,
    atualizarPontuacaoPerguntaExistente,
    moverPerguntaSelecionadaParaCima,
    moverPerguntaSelecionadaParaBaixo,
    adicionarNovaPerguntaNoTeste,
    atualizarNovaPerguntaNoTeste,
    removerNovaPerguntaNoTeste,
    moverNovaPerguntaParaCima,
    moverNovaPerguntaParaBaixo,
    cancelarEdicaoTeste,
    totalPontuacaoTeste,
    excedePontuacaoMaxima,
}) {
    const config =
        CONTEXTO_AVALIACAO[testeForm.data.tipo_avaliacao] ||
        CONTEXTO_AVALIACAO.Desafio;
    const isTarefa = testeForm.data.tipo_desafio === "Tarefa";

    const [mostrarModalBadge, setMostrarModalBadge] = useState(false);

    const RARIDADE_INFO = {
        1: { label: "Bronze",   classes: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
        2: { label: "Prata",    classes: "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200" },
        3: { label: "Ouro",     classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
        4: { label: "Lendária", classes: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" },
    };


    const badgeDefaults = () => ({
        badge_id: "",
        criterio: "conclusao",
        nota_minima: "",
        nota_maxima: "",
    });

    const adicionarBadge = () => {
        testeForm.setData("badges", [...(testeForm.data.badges || []), badgeDefaults()]);
    };

    const removerBadge = (index) => {
        testeForm.setData("badges", (testeForm.data.badges || []).filter((_, i) => i !== index));
    };

    const atualizarBadge = (index, campo, valor) => {
        const lista = [...(testeForm.data.badges || [])];
        const entrada = { ...lista[index], [campo]: valor };

        if (campo === "nota_minima" && valor !== "") {
            const min = parseFloat(valor);
            const max = parseFloat(entrada.nota_maxima);
            if (!isNaN(max) && min > max) entrada.nota_maxima = valor;
        }
        if (campo === "nota_maxima" && valor !== "") {
            const max = parseFloat(valor);
            const min = parseFloat(entrada.nota_minima);
            if (!isNaN(min) && max < min) entrada.nota_minima = valor;
        }

        lista[index] = entrada;
        testeForm.setData("badges", lista);
    };

    const obterRespostaPergunta = (pergunta) => {
        const opcoes = Array.isArray(pergunta?.opcoes) ? pergunta.opcoes : [];
        if (pergunta?.tipo_pergunta === "Dissertativa") {
            return "Resposta aberta (correção manual).";
        }

        const respostasCorretas = opcoes
            .filter((opcao) => Boolean(opcao?.is_correct))
            .map((opcao) => String(opcao?.texto_opcao || "").trim())
            .filter(Boolean);

        return respostasCorretas.length > 0
            ? respostasCorretas.join(" | ")
            : "Sem resposta correta definida.";
    };

    return (
        <>
        {mostrarModalBadge && (
            <GerirBadgesModal
                raridadeInfo={RARIDADE_INFO}
                badgesProfessor={badgesProfessor}
                onClose={() => setMostrarModalBadge(false)}
            />
        )}
        <form
            onSubmit={submitTeste}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5"
        >
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {editingTesteId
                    ? `Editar ${config.nome}`
                    : `Criar ${config.nome}`}
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
                        placeholder={config.placeholderTitulo}
                        required
                    />
                </div>

                {config.temInstrucoes && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {isTarefa ? "Descrição da Tarefa" : "Instruções ou Contexto"}
                        </label>
                        <textarea
                            rows={isTarefa ? "6" : "3"}
                            value={testeForm.data.instrucoes || ""}
                            onChange={(e) =>
                                testeForm.setData("instrucoes", e.target.value)
                            }
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-y"
                            placeholder={
                                isTarefa
                                    ? "Descreve em detalhe o que o aluno deve entregar, critérios e prazos..."
                                    : "Introduza as instruções iniciais para os alunos..."
                            }
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo de desafio
                    </label>
                    <select
                        value={testeForm.data.tipo_desafio}
                        onChange={(e) =>
                            testeForm.setData("tipo_desafio", e.target.value)
                        }
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                        {TIPO_DESAFIO_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tempo limite (minutos)
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={testeForm.data.duracao_minutos}
                        onChange={(e) =>
                            testeForm.setData("duracao_minutos", e.target.value)
                        }
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        placeholder="Opcional"
                    />
                </div>

                {!config.semPesoNota && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Peso na nota final (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={testeForm.data.peso_avaliacao ?? "0"}
                            onChange={(e) =>
                                testeForm.setData("peso_avaliacao", e.target.value)
                            }
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            placeholder="0 a 100"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Define quanto esta avaliação conta para a nota final.
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        XP Base da Conclusão
                    </label>
                    <input
                        type="number"
                        min={0}
                        value={testeForm.data.xp_base ?? 1}
                        onChange={(e) =>
                            testeForm.setData("xp_base", e.target.value)
                        }
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                </div>

                <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Badges do Desafio
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setMostrarModalBadge(true)}
                                className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300"
                            >
                                Gerir Badges
                            </button>
                            <button
                                type="button"
                                onClick={adicionarBadge}
                                className="px-3 py-1 rounded-md text-xs font-semibold bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300"
                            >
                                + Adicionar ao Desafio
                            </button>
                        </div>
                    </div>

                    {(testeForm.data.badges || []).length === 0 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                            Sem badges configuradas. Clica em "Adicionar ao Desafio" para associar uma.
                        </p>
                    )}

                    {(testeForm.data.badges || []).map((entrada, index) => (
                        <BadgeEntrada
                            key={index}
                            entrada={entrada}
                            index={index}
                            badgesProfessor={badgesProfessor}
                            raridadeInfo={RARIDADE_INFO}
                            onChange={atualizarBadge}
                            onRemove={removerBadge}
                        />
                    ))}
                </div>
            </div>

            {testeForm.data.tipo_desafio === "Tarefa" && (
                <div className="rounded-lg border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 p-4 space-y-4">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                        Ficheiros do enunciado (opcional)
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Ficheiro principal
                        </label>
                        <input
                            type="file"
                            onChange={(e) =>
                                testeForm.setData(
                                    "anexo_global_ficheiro",
                                    e.target.files?.[0] || null,
                                )
                            }
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Ficheiro principal do enunciado (máx. 20MB). Os alunos vêem este como "Anexo principal".
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Ficheiros adicionais
                        </label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) =>
                                testeForm.setData(
                                    "anexos_professor_ficheiros",
                                    Array.from(e.target.files || []),
                                )
                            }
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Podes selecionar vários ficheiros de apoio (máx. 20MB cada).
                        </p>
                        {Array.isArray(testeForm.data.anexos_professor_ficheiros) &&
                            testeForm.data.anexos_professor_ficheiros.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {testeForm.data.anexos_professor_ficheiros.map((f, i) => (
                                        <li key={i} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1">
                                            <span className="truncate">{f.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = testeForm.data.anexos_professor_ficheiros.filter((_, idx) => idx !== i);
                                                    testeForm.setData("anexos_professor_ficheiros", updated);
                                                }}
                                                className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
                                            >
                                                ✕
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                    </div>

                    {(testeForm.errors.anexo_global_ficheiro || testeForm.errors["anexos_professor_ficheiros.0"]) && (
                        <p className="text-xs text-red-600">
                            {testeForm.errors.anexo_global_ficheiro || testeForm.errors["anexos_professor_ficheiros.0"]}
                        </p>
                    )}
                </div>
            )}

            {!isTarefa && mostrarListaPerguntas && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Filtrar por categoria
                        </label>
                        <select
                            value={categoriaFiltro}
                            onChange={(e) => setCategoriaFiltro(e.target.value)}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">Todas as categorias</option>
                            {categorias.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Pesquisar pergunta
                        </label>
                        <input
                            type="text"
                            value={textoPerguntaFiltro}
                            onChange={(e) =>
                                setTextoPerguntaFiltro(e.target.value)
                            }
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            placeholder="Pesquisar pelo texto da pergunta"
                        />
                    </div>

                    <div className="space-y-2">
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Autor da pergunta
                        </span>
                        <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input
                                type="checkbox"
                                checked={mostrarApenasMinhasPerguntas}
                                onChange={(e) =>
                                    setMostrarApenasMinhasPerguntas(
                                        e.target.checked,
                                    )
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Mostrar apenas perguntas criadas por mim
                        </label>
                    </div>
                </div>
            )}

            {!isTarefa && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">
                            Selecionar perguntas existentes
                        </h4>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">
                                Selecionadas:{" "}
                                {(testeForm.data.pergunta_ids || []).length}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    setMostrarListaPerguntas((estado) => !estado)
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
                            {perguntasFiltradas.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    Sem perguntas para os filtros aplicados.
                                </p>
                            )}
                            {perguntasFiltradas.map((pergunta) => (
                                <div
                                    key={pergunta.id}
                                    className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                                >
                                    <input
                                        type="checkbox"
                                        checked={(
                                            testeForm.data.pergunta_ids || []
                                        ).includes(pergunta.id)}
                                        onChange={() =>
                                            togglePerguntaSelecionada(pergunta.id)
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
                                        <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                                            Resposta:{" "}
                                            {obterRespostaPergunta(pergunta)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!isTarefa && (testeForm.data.pergunta_ids || []).length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">
                        Ordem das perguntas selecionadas
                    </h4>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                        {(testeForm.data.pergunta_ids || []).map(
                            (perguntaId, index) => {
                                const pergunta = perguntasDisponiveis.find(
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
                                                {index + 1}. {pergunta.texto}
                                            </span>
                                            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                                                Resposta:{" "}
                                                {obterRespostaPergunta(
                                                    pergunta,
                                                )}
                                            </p>
                                            <div className="mt-2 max-w-[190px]">
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                                    Pontuação
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="20"
                                                    value={
                                                        testeForm.data
                                                            .pontuacao_por_pergunta?.[
                                                            pergunta.id
                                                        ] ?? 1
                                                    }
                                                    onChange={(e) =>
                                                        atualizarPontuacaoPerguntaExistente(
                                                            pergunta.id,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 self-start">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        moverPerguntaSelecionadaParaCima(
                                                            index,
                                                        )
                                                    }
                                                    disabled={index === 0}
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
                                                            testeForm.data
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
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    togglePerguntaSelecionada(
                                                        perguntaId,
                                                    )
                                                }
                                                className="px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                );
                            },
                        )}
                    </div>
                </div>
            )}

            {!isTarefa && (
                <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">
                        Criar novas perguntas ({config.nome.toLowerCase()})
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
                            onRemove={() => removerNovaPerguntaNoTeste(index)}
                            onMoveUp={
                                index > 0
                                    ? () => moverNovaPerguntaParaCima(index)
                                    : undefined
                            }
                            onMoveDown={
                                index <
                                (testeForm.data.novas_perguntas || []).length -
                                    1
                                    ? () => moverNovaPerguntaParaBaixo(index)
                                    : undefined
                            }
                            title={`Nova pergunta #${index + 1}`}
                            categorias={categorias}
                            showPontuacao={true}
                        />
                    ),
                )}
            </div>
            )}


            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold"
                    disabled={testeForm.processing}
                >
                    {editingTesteId
                        ? `Guardar Alterações`
                        : `Guardar ${config.nome}`}
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

            {!isTarefa && (
                <>
                    <div
                        className={`text-sm font-semibold ${
                            excedePontuacaoMaxima && config.escalaFixa20
                                ? "text-red-600"
                                : "text-emerald-600"
                        }`}
                    >
                        Pontuação total: {totalPontuacaoTeste}
                        {config.escalaFixa20 && "/20"}
                    </div>

                    {testeForm.errors.total_pontuacao && (
                        <p className="text-sm text-red-600">
                            {testeForm.errors.total_pontuacao}
                        </p>
                    )}
                </>
            )}
            {Object.keys(testeForm.errors || {}).length > 0 && (
                <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-400 dark:border-red-800 rounded-lg text-sm">
                    <strong className="flex items-center gap-2 mb-2 font-bold text-base">
                        <span>❌</span> Não foi possível guardar. Verifica os dados preenchidos:
                    </strong>
                    <ul className="list-disc ml-8 space-y-1 font-medium">
                        {Object.entries(testeForm.errors).map(([key, err]) => (
                            <li key={key}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}
        </form>
        </>
    );
}
