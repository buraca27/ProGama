import React from "react";
import NovaPerguntaInline from "./NovaPerguntaInline";
import { TIPO_AVALIACAO_OPTIONS } from "./constants";

export default function CriarTesteSection({
    editingTesteId,
    submitTeste,
    testeForm,
    categorias,
    categoriaFiltro,
    setCategoriaFiltro,
    mostrarListaPerguntas,
    setMostrarListaPerguntas,
    perguntasFiltradasPorCategoria,
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
    return (
        <form
            onSubmit={submitTeste}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5"
        >
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {editingTesteId ? "Editar Teste" : "Criar Teste"}
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
                            testeForm.setData("tipo_avaliacao", e.target.value)
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
                            testeForm.setData("duracao_minutos", e.target.value)
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
                            testeForm.setData("data_hora_fecho", e.target.value)
                        }
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        required
                    />
                </div>
            </div>

            {mostrarListaPerguntas && (
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
            )}

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
                        {perguntasFiltradasPorCategoria.length === 0 && (
                            <p className="text-sm text-gray-500">
                                Sem perguntas nesta categoria.
                            </p>
                        )}
                        {perguntasFiltradasPorCategoria.map((pergunta) => (
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
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {(testeForm.data.pergunta_ids || []).length > 0 && (
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
                                                                .pergunta_ids || []
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
                                                Remover do teste
                                            </button>
                                        </div>
                                    </div>
                                );
                            },
                        )}
                    </div>
                </div>
            )}

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
                    {editingTesteId ? "Guardar Alterações" : "Guardar Teste"}
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
                    excedePontuacaoMaxima ? "text-red-600" : "text-emerald-600"
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
                    Não foi possível guardar o teste. Verifica os dados
                    preenchidos.
                </p>
            )}
        </form>
    );
}
