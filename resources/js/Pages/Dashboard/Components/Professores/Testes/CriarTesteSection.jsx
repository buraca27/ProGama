import React, { useEffect, useMemo, useRef, useState } from "react";
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
    const [ficheirosLocaisProf, setFicheirosLocaisProf] = useState([]);
    const fileInputRefProf = useRef(null);

    const extrairNomeFicheiro = (valor) => {
        const bruto = String(valor || "").split("?")[0];
        return bruto.split("/").pop() || "Anexo";
    };

    const anexosAtuais = useMemo(() => {
        if (!editingTesteId) return [];

        const lista = [];
        if (testeForm.data.anexo_global_url_atual) {
            lista.push({
                id: `principal-${testeForm.data.anexo_global_url_atual}`,
                nome: extrairNomeFicheiro(testeForm.data.anexo_global_url_atual),
                atual: true,
                tipo: "principal",
            });
        }

        const adicionais = Array.isArray(testeForm.data.anexos_professor_atuais)
            ? testeForm.data.anexos_professor_atuais
            : [];

        adicionais.forEach((anexo, idx) => {
            const origem =
                anexo?.nome || anexo?.caminho || anexo?.url || `Anexo ${idx + 1}`;
            lista.push({
                id: `adicional-${anexo?.caminho || anexo?.url || idx}`,
                nome: extrairNomeFicheiro(origem),
                atual: true,
                tipo: "adicional",
                idxAtual: idx,
            });
        });

        return lista;
    }, [
        editingTesteId,
        testeForm.data.anexo_global_url_atual,
        testeForm.data.anexos_professor_atuais,
    ]);

    useEffect(() => {
        setFicheirosLocaisProf([]);
    }, [editingTesteId]);

    const sincronizarCamposAnexo = (novaLista) => {
        const ficheiros = novaLista.map((item) => item.file);
        const temAnexosAtuais = anexosAtuais.length > 0;

        if (editingTesteId && temAnexosAtuais) {
            testeForm.setData("anexo_global_ficheiro", null);
            testeForm.setData("anexos_professor_ficheiros", ficheiros);
            return;
        }

        testeForm.setData("anexo_global_ficheiro", ficheiros[0] || null);
        testeForm.setData("anexos_professor_ficheiros", ficheiros.slice(1));
    };

    const adicionarFicheiroProf = (file) => {
        if (!file) return;
        const novoFicheiro = {
            id: Date.now(),
            file: file,
            nome: file.name,
        };
        const novaLista = [...ficheirosLocaisProf, novoFicheiro];
        setFicheirosLocaisProf(novaLista);
        sincronizarCamposAnexo(novaLista);
        if (fileInputRefProf.current) fileInputRefProf.current.value = "";
    };

    const removerFicheiroProf = (id) => {
        const novaLista = ficheirosLocaisProf.filter((f) => f.id !== id);
        setFicheirosLocaisProf(novaLista);
        sincronizarCamposAnexo(novaLista);
    };

    const removerAnexoAtual = (anexo) => {
        if (anexo?.tipo === "principal") {
            testeForm.setData("anexo_global_url_atual", "");
            return;
        }

        if (anexo?.tipo === "adicional") {
            const atuais = Array.isArray(testeForm.data.anexos_professor_atuais)
                ? testeForm.data.anexos_professor_atuais
                : [];
            const novaLista = atuais.filter((_, idx) => idx !== anexo.idxAtual);
            testeForm.setData("anexos_professor_atuais", novaLista);
        }
    };
    const config =
        CONTEXTO_AVALIACAO[testeForm.data.tipo_avaliacao] ||
        CONTEXTO_AVALIACAO.Desafio;
    const isTarefa = testeForm.data.tipo_desafio === "Tarefa";

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
                        value={testeForm.data.xp_base ?? 50}
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
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            testeForm.setData(
                                "nova_badge_imagem",
                                e.target.files?.[0] || null,
                            )
                        }
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                </div>
            </div>

            {testeForm.data.tipo_desafio === "Tarefa" && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Anexo(s) da tarefa
                            </label>
                            <button
                                type="button"
                                onClick={() => fileInputRefProf.current?.click()}
                                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition"
                            >
                                + Adicionar
                            </button>
                        </div>

                        <input
                            ref={fileInputRefProf}
                            type="file"
                            onChange={(e) =>
                                adicionarFicheiroProf(e.target.files?.[0])
                            }
                            className="hidden"
                        />

                        {(anexosAtuais.length > 0 || ficheirosLocaisProf.length > 0) && (
                            <div className="mt-2 space-y-2">
                                {[...anexosAtuais, ...ficheirosLocaisProf.map((f) => ({
                                    id: f.id,
                                    nome: f.nome,
                                    novo: true,
                                    tipo: "novo",
                                }))].map((f) => (
                                    <div
                                        key={f.id}
                                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className="text-gray-500">📄</span>
                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                {f.nome}
                                            </span>
                                            {f.novo && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                                    novo
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                f.novo
                                                    ? removerFicheiroProf(f.id)
                                                    : removerAnexoAtual(f)
                                            }
                                            className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                                            title="Remover anexo"
                                            aria-label="Remover anexo"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="h-4 w-4"
                                            >
                                                <path d="M9 3.75A2.25 2.25 0 0 0 6.75 6v.75H4.5a.75.75 0 0 0 0 1.5h.63l.72 10.118A2.25 2.25 0 0 0 8.094 20.5h7.812a2.25 2.25 0 0 0 2.244-2.132l.72-10.118h.63a.75.75 0 0 0 0-1.5h-2.25V6A2.25 2.25 0 0 0 15 3.75H9Zm6.75 3V6A.75.75 0 0 0 15 5.25H9A.75.75 0 0 0 8.25 6v.75h7.5ZM9.75 10.5a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0v-5.25a.75.75 0 0 1 .75-.75Zm4.5 0a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0v-5.25a.75.75 0 0 1 .75-.75Z" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            O primeiro ficheiro fica como anexo principal e os seguintes aparecem como anexos adicionais para o aluno.
                        </p>
                    </div>
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
            {Object.values(testeForm.errors || {}).length > 0 && (
                <p className="text-sm text-red-600">
                    Não foi possível guardar. Verifica os dados preenchidos.
                </p>
            )}
        </form>
    );
}
