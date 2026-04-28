import React from "react";
import NovaPerguntaInline from "./NovaPerguntaInline";

export default function BancoPerguntasSection({
    showQuestionForm,
    setShowQuestionForm,
    submitPergunta,
    perguntaForm,
    editingPerguntaId,
    submitPerguntaEdicao,
    perguntaEditForm,
    cancelarEdicaoPergunta,
    perguntasDisponiveis,
    carregarPerguntaNoEditor,
    categorias,
}) {
    return (
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
                        onChange={(value) => perguntaForm.setData(value)}
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
                    {Object.values(perguntaForm.errors || {}).length > 0 && (
                        <p className="text-sm text-red-600">
                            Não foi possível guardar a pergunta. Verifica os
                            campos.
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
                        onChange={(value) => perguntaEditForm.setData(value)}
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
                    {Object.values(perguntaEditForm.errors || {}).length >
                        0 && (
                        <p className="text-sm text-red-600">
                            Não foi possível atualizar a pergunta. Verifica os
                            campos.
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
                            Tipo: {pergunta.tipo_pergunta.replaceAll("_", " ")}
                        </p>
                        <div className="mt-3">
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
    );
}
