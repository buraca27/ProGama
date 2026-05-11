import React, { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
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
    perguntasBancoProfessor,
    perguntasBancoFiltros,
    carregarPerguntaNoEditor,
    categorias,
}) {
    const hasMountedRef = useRef(false);
    const filtrosIniciais = perguntasBancoFiltros || {};
    const parseFiltroMinhas = (valor) => String(valor ?? "1") !== "0";
    const [categoriaFiltroBanco, setCategoriaFiltroBanco] = useState(
        filtrosIniciais.categoria || "",
    );
    const [textoFiltroBanco, setTextoFiltroBanco] = useState(
        filtrosIniciais.q || "",
    );
    const [mostrarApenasMinhas, setMostrarApenasMinhas] = useState(
        parseFiltroMinhas(filtrosIniciais.minhas),
    );

    const perguntasPaginadas = perguntasBancoProfessor?.data || [];
    const paginaAtual = perguntasBancoProfessor?.current_page || 1;
    const totalPaginas = perguntasBancoProfessor?.last_page || 1;

    useEffect(() => {
        setCategoriaFiltroBanco(filtrosIniciais.categoria || "");
        setTextoFiltroBanco(filtrosIniciais.q || "");
        setMostrarApenasMinhas(parseFiltroMinhas(filtrosIniciais.minhas));
    }, [filtrosIniciais.categoria, filtrosIniciais.q, filtrosIniciais.minhas]);

    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            return;
        }

        const timeoutId = setTimeout(() => {
            router.get(
                route("dashboard"),
                {
                    perguntas_page: 1,
                    perguntas_categoria: categoriaFiltroBanco || undefined,
                    perguntas_q: textoFiltroBanco || undefined,
                    perguntas_minhas: mostrarApenasMinhas ? 1 : 0,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ["perguntasBancoProfessor", "perguntasBancoFiltros"],
                },
            );
        }, 250);

        return () => clearTimeout(timeoutId);
    }, [categoriaFiltroBanco, textoFiltroBanco, mostrarApenasMinhas]);

    const mudarPagina = (page) => {
        router.get(
            route("dashboard"),
            {
                perguntas_page: page,
                perguntas_categoria: categoriaFiltroBanco || undefined,
                perguntas_q: textoFiltroBanco || undefined,
                perguntas_minhas: mostrarApenasMinhas ? 1 : 0,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ["perguntasBancoProfessor", "perguntasBancoFiltros"],
            },
        );
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Filtrar por categoria
                    </label>
                    <select
                        value={categoriaFiltroBanco}
                        onChange={(e) =>
                            setCategoriaFiltroBanco(e.target.value)
                        }
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Pesquisar pergunta
                    </label>
                    <input
                        type="text"
                        value={textoFiltroBanco}
                        onChange={(e) => setTextoFiltroBanco(e.target.value)}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        placeholder="Pesquisar pelo texto da pergunta"
                    />
                </div>

                <div>
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Autor da pergunta
                    </span>
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                            type="checkbox"
                            checked={mostrarApenasMinhas}
                            onChange={(e) =>
                                setMostrarApenasMinhas(e.target.checked)
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Mostrar apenas perguntas criadas por mim
                    </label>
                </div>
            </div>

            <div className="space-y-3 max-h-[26rem] overflow-y-auto pr-1">
                {perguntasPaginadas.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Não existem perguntas para os filtros aplicados.
                    </p>
                )}
                {perguntasPaginadas.map((pergunta) => (
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
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                            Resposta: {obterRespostaPergunta(pergunta)}
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

            {perguntasPaginadas.length > 0 && (
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
        </div>
    );
}
