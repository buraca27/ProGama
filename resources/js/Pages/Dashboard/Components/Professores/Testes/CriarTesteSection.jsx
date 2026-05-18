import React, { useState, useEffect } from "react";
import NovaPerguntaInline from "./NovaPerguntaInline";
import { TIPO_DESAFIO_OPTIONS } from "./constants";
import { CONTEXTO_AVALIACAO } from "./constants";

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

    const [badgeImagePreview, setBadgeImagePreview] = useState(null);
    useEffect(() => {
        const file = testeForm.data.nova_badge_imagem;
        if (!file) { setBadgeImagePreview(null); return; }
        const url = URL.createObjectURL(file);
        setBadgeImagePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [testeForm.data.nova_badge_imagem]);

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

                <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                            type="checkbox"
                            checked={Boolean(testeForm.data.auto_award_xp)}
                            onChange={(e) =>
                                testeForm.setData(
                                    "auto_award_xp",
                                    e.target.checked,
                                )
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Atribuir XP automaticamente após avaliação
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Badge existente (opcional)
                    </label>
                    <select
                        value={testeForm.data.badge_existente_id || ""}
                        onChange={(e) =>
                            testeForm.setData("badge_existente_id", e.target.value)
                        }
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="">Sem badge automática</option>
                        {(badgesProfessor || []).map((badge) => (
                            <option key={badge.id} value={badge.id}>
                                {badge.nome}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ou criar nova badge
                    </label>
                    <input
                        type="text"
                        value={testeForm.data.nova_badge_nome || ""}
                        onChange={(e) =>
                            testeForm.setData("nova_badge_nome", e.target.value)
                        }
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        placeholder="Nome da badge"
                    />
                    <textarea
                        rows="2"
                        value={testeForm.data.nova_badge_descricao || ""}
                        onChange={(e) =>
                            testeForm.setData(
                                "nova_badge_descricao",
                                e.target.value,
                            )
                        }
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        placeholder="Descrição curta da badge"
                    />
                    <select
                        value={testeForm.data.nova_badge_raridade || "1"}
                        onChange={(e) =>
                            testeForm.setData("nova_badge_raridade", e.target.value)
                        }
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="1">Bronze (Comum)</option>
                        <option value="2">Prata (Incomum)</option>
                        <option value="3">Ouro (Raro)</option>
                        <option value="4">Lendária</option>
                    </select>
                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                testeForm.setData(
                                    "nova_badge_imagem",
                                    e.target.files?.[0] || null,
                                )
                            }
                            className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        {badgeImagePreview && (
                            <img
                                src={badgeImagePreview}
                                alt="Preview badge"
                                className="h-12 w-12 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 shrink-0"
                            />
                        )}
                    </div>
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
    );
}
