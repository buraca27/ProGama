// resources/js/Pages/Dashboard/Components/Professores/TestesView.jsx

import React, { useMemo, useState } from "react";
import { useForm } from "@inertiajs/react";
import BancoPerguntasSection from "./Testes/BancoPerguntasSection";
import CriarTesteSection from "./Testes/CriarTesteSection";
import TestesCriadosList from "./Testes/TestesCriadosList";
import {
    createNovaPerguntaTesteDefaults,
    createPerguntaFormDefaults,
    createTesteFormDefaults,
} from "./Testes/constants";

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
    const perguntaForm = useForm(createPerguntaFormDefaults());

    const perguntaEditForm = useForm(createPerguntaFormDefaults());

    const testeForm = useForm(createTesteFormDefaults());

    const perguntasDisponiveis = useMemo(
        () => perguntasProfessor || [],
        [perguntasProfessor],
    );

    const perguntasFiltradasPorCategoria = useMemo(
        () =>
            perguntasDisponiveis.filter(
                (p) =>
                    !categoriaFiltro ||
                    p.id_categoria === Number(categoriaFiltro),
            ),
        [perguntasDisponiveis, categoriaFiltro],
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
                perguntaForm.setData(createPerguntaFormDefaults());
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
        perguntaEditForm.setData(createPerguntaFormDefaults());
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
            createNovaPerguntaTesteDefaults(),
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

    const montarPayloadPontuacoes = () =>
        (testeForm.data.pergunta_ids || []).reduce((acc, idPergunta) => {
            const valorAtual = Number(
                testeForm.data.pontuacao_por_pergunta?.[idPergunta] ?? 1,
            );
            acc[idPergunta] = Number.isNaN(valorAtual)
                ? 1
                : Math.min(20, Math.max(1, valorAtual));
            return acc;
        }, {});

    const limparNovasPerguntasVazias = (perguntas = []) =>
        perguntas.filter((pergunta) => {
            const temTexto = Boolean(String(pergunta?.texto || "").trim());
            const temCategoria = Boolean(pergunta?.id_categoria);
            const temAnexo = Boolean(pergunta?.url_anexo_pergunta);
            const temOpcoes = (pergunta?.opcoes || []).some((op) =>
                Boolean(String(op || "").trim()),
            );

            return temTexto || temCategoria || temAnexo || temOpcoes;
        });

    const submitTeste = (e) => {
        e.preventDefault();
        const novasPerguntasLimpas = limparNovasPerguntasVazias(
            testeForm.data.novas_perguntas || [],
        );
        const pontuacoesNormalizadas = montarPayloadPontuacoes();
        if (
            novasPerguntasLimpas.length !==
            (testeForm.data.novas_perguntas || []).length
        ) {
            testeForm.setData("novas_perguntas", novasPerguntasLimpas);
        }
        testeForm.setData("pontuacao_por_pergunta", pontuacoesNormalizadas);
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
            testeForm.setData(createTesteFormDefaults());
            setEditingTesteId(null);
        };

        const transformFn = (data) => ({
            ...data,
            novas_perguntas: novasPerguntasLimpas,
            pontuacao_por_pergunta: pontuacoesNormalizadas,
            data_hora_abertura: data.data_hora_abertura || null,
            data_hora_fecho: data.data_hora_fecho || null,
        });

        if (editingTesteId) {
            testeForm.transform(transformFn);
            testeForm.put(route("professor.testes.update", editingTesteId), {
                preserveScroll: true,
                onSuccess,
                onFinish: () => testeForm.transform((data) => data),
            });
            return;
        }

        testeForm.transform(transformFn);
        testeForm.post(route("professor.testes.store"), {
            preserveScroll: true,
            onSuccess,
            onFinish: () => testeForm.transform((data) => data),
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
                (acc, p) => ({
                    ...acc,
                    [p.id]: p.pivot?.valor_pontuacao ?? p.valor_pontuacao ?? 1,
                }),
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
        testeForm.setData(createTesteFormDefaults());
        setCategoriaFiltro("");
    };

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

            <div className="grid grid-cols-1 gap-6">
                {activeSection === "banco" && (
                    <BancoPerguntasSection
                        showQuestionForm={showQuestionForm}
                        setShowQuestionForm={setShowQuestionForm}
                        submitPergunta={submitPergunta}
                        perguntaForm={perguntaForm}
                        editingPerguntaId={editingPerguntaId}
                        submitPerguntaEdicao={submitPerguntaEdicao}
                        perguntaEditForm={perguntaEditForm}
                        cancelarEdicaoPergunta={cancelarEdicaoPergunta}
                        perguntasDisponiveis={perguntasDisponiveis}
                        carregarPerguntaNoEditor={carregarPerguntaNoEditor}
                        categorias={categorias}
                    />
                )}

                {activeSection === "criar" && (
                    <CriarTesteSection
                        editingTesteId={editingTesteId}
                        submitTeste={submitTeste}
                        testeForm={testeForm}
                        categorias={categorias}
                        categoriaFiltro={categoriaFiltro}
                        setCategoriaFiltro={setCategoriaFiltro}
                        mostrarListaPerguntas={mostrarListaPerguntas}
                        setMostrarListaPerguntas={setMostrarListaPerguntas}
                        perguntasFiltradasPorCategoria={
                            perguntasFiltradasPorCategoria
                        }
                        togglePerguntaSelecionada={togglePerguntaSelecionada}
                        perguntasDisponiveis={perguntasDisponiveis}
                        atualizarPontuacaoPerguntaExistente={
                            atualizarPontuacaoPerguntaExistente
                        }
                        moverPerguntaSelecionadaParaCima={
                            moverPerguntaSelecionadaParaCima
                        }
                        moverPerguntaSelecionadaParaBaixo={
                            moverPerguntaSelecionadaParaBaixo
                        }
                        adicionarNovaPerguntaNoTeste={
                            adicionarNovaPerguntaNoTeste
                        }
                        atualizarNovaPerguntaNoTeste={
                            atualizarNovaPerguntaNoTeste
                        }
                        removerNovaPerguntaNoTeste={removerNovaPerguntaNoTeste}
                        moverNovaPerguntaParaCima={moverNovaPerguntaParaCima}
                        moverNovaPerguntaParaBaixo={moverNovaPerguntaParaBaixo}
                        cancelarEdicaoTeste={cancelarEdicaoTeste}
                        totalPontuacaoTeste={totalPontuacaoTeste}
                        excedePontuacaoMaxima={excedePontuacaoMaxima}
                    />
                )}
            </div>

            <TestesCriadosList
                testesProfessor={testesProfessor}
                carregarTesteNoEditor={carregarTesteNoEditor}
            />
        </div>
    );
}
