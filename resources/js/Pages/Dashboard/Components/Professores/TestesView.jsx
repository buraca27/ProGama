// resources/js/Pages/Dashboard/Components/Professores/TestesView.jsx

import React, { useMemo, useState } from "react";
import { useForm } from "@inertiajs/react";
import BancoPerguntasSection from "./Testes/BancoPerguntasSection";
import CriarTesteSection from "./Testes/CriarTesteSection";
import TestesCriadosList from "./Testes/TestesCriadosList";
import {
    CONTEXTO_AVALIACAO,
    createNovaPerguntaTesteDefaults,
    createPerguntaFormDefaults,
    createTesteFormDefaults,
} from "./Testes/constants";

export default function TestesView({
    authUserId = null,
    perguntasProfessor = [],
    perguntasBancoProfessor = null,
    perguntasBancoFiltros = null,
    testesProfessor = [],
    categorias = [],
    badgesProfessor = [],
}) {
    const [activeSection, setActiveSection] = useState("banco");
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [editingPerguntaId, setEditingPerguntaId] = useState(null);
    const [editingTesteId, setEditingTesteId] = useState(null);
    const [categoriaFiltro, setCategoriaFiltro] = useState("");
    const [textoPerguntaFiltro, setTextoPerguntaFiltro] = useState("");
    const [mostrarApenasMinhasPerguntas, setMostrarApenasMinhasPerguntas] =
        useState(true);
    const [mostrarListaPerguntas, setMostrarListaPerguntas] = useState(true);
    const [toastMsg, setToastMsg] = useState(null);

    const mostrarToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 4000);
    };

    // --- Formulários Inertia ---
    const perguntaForm = useForm(createPerguntaFormDefaults());

    const perguntaEditForm = useForm(createPerguntaFormDefaults());

    const testeForm = useForm(createTesteFormDefaults());

    const perguntasDisponiveis = useMemo(
        () => perguntasProfessor || [],
        [perguntasProfessor],
    );

    const perguntasFiltradas = useMemo(
        () =>
            perguntasDisponiveis.filter(
                (p) =>
                    (!mostrarApenasMinhasPerguntas ||
                        !authUserId ||
                        Number(p.id_formador_criador) === Number(authUserId)) &&
                    (!categoriaFiltro ||
                        p.id_categoria === Number(categoriaFiltro)) &&
                    (!textoPerguntaFiltro ||
                        String(p.texto || "")
                            .toLowerCase()
                            .includes(textoPerguntaFiltro.toLowerCase())),
            ),
        [
            perguntasDisponiveis,
            mostrarApenasMinhasPerguntas,
            authUserId,
            categoriaFiltro,
            textoPerguntaFiltro,
        ],
    );

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
        const indicesCorretos = (pergunta.opcoes || [])
            .map((o, index) => (o.is_correct ? index : null))
            .filter((index) => index !== null);
        const opcaoVerdadeiro = (pergunta.opcoes || []).find(
            (o) => o.texto_opcao === "Verdadeiro",
        );

        perguntaEditForm.setData({
            texto: pergunta.texto || "",
            tipo_pergunta: pergunta.tipo_pergunta || "Dissertativa",
            id_categoria: pergunta.id_categoria || "",
            url_anexo_pergunta: pergunta.url_anexo_pergunta || null,
            opcoes: opcoes.length > 0 ? opcoes : ["", ""],
            resposta_correta_index:
                indicesCorretos.length > 0 ? indicesCorretos[0] : 0,
            resposta_correta_indices:
                indicesCorretos.length > 0 ? indicesCorretos : [0],
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

    const montarPayloadPontuacoesExplicito = () =>
        (testeForm.data.pergunta_ids || []).map((idPergunta) => {
            const valorAtual = Number(
                testeForm.data.pontuacao_por_pergunta?.[idPergunta] ?? 1,
            );

            return {
                id_pergunta: Number(idPergunta),
                valor_pontuacao: Number.isNaN(valorAtual)
                    ? 1
                    : Math.min(20, Math.max(1, valorAtual)),
            };
        });

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
        const pontuacoesExplicitas = montarPayloadPontuacoesExplicito();
        if (
            novasPerguntasLimpas.length !==
            (testeForm.data.novas_perguntas || []).length
        ) {
            testeForm.setData("novas_perguntas", novasPerguntasLimpas);
        }
        testeForm.setData("pontuacao_por_pergunta", pontuacoesNormalizadas);
        const tipoAvaliacao = "Desafio";
        const configAtual = CONTEXTO_AVALIACAO[tipoAvaliacao];
        if (configAtual?.semPesoNota) {
            testeForm.setData("peso_avaliacao", "0");
        }
        if (configAtual?.escalaFixa20 && totalPontuacaoTeste < 20) {
            mostrarToast(
                `O teste tem de ter exatamente 20 valores. Atualmente tem ${totalPontuacaoTeste} valor(es).`,
            );
            return;
        }
        if (excedePontuacaoMaxima) {
            mostrarToast(
                "A soma da pontuação das perguntas não pode ultrapassar 20. Ajusta os valores antes de guardar.",
            );
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
            tipo_avaliacao: "Desafio",
            peso_avaliacao: configAtual?.semPesoNota ? 0 : data.peso_avaliacao,
            xp_base: Number(data.xp_base || 0),
            auto_award_xp: Boolean(data.auto_award_xp),
            novas_perguntas: novasPerguntasLimpas,
            pontuacao_por_pergunta: pontuacoesNormalizadas,
            pontuacoes_perguntas: pontuacoesExplicitas,
        });

        if (editingTesteId) {
            testeForm.transform(transformFn);
            testeForm.put(route("professor.testes.update", editingTesteId), {
                preserveScroll: true,
                forceFormData: true,
                onSuccess,
                onFinish: () => testeForm.transform((data) => data),
            });
            return;
        }

        testeForm.transform(transformFn);
        testeForm.post(route("professor.testes.store"), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess,
            onFinish: () => testeForm.transform((data) => data),
        });
    };

    const carregarTesteNoEditor = (teste) => {
        const primeiraBadge = Array.isArray(teste.badges_json)
            ? teste.badges_json[0]
            : null;

        testeForm.setData({
            titulo: teste.titulo || "",
            instrucoes: teste.instrucoes || "",
            tipo_avaliacao: "Desafio",
            tipo_desafio: teste.desafio_associado?.tipo_desafio || "Quiz",
            peso_avaliacao: teste.peso_avaliacao ?? "0",
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
            xp_base: teste.xp_base ?? 1,
            auto_award_xp: teste.auto_award_xp ?? true,
            badge_existente_id:
                typeof primeiraBadge === "object" && primeiraBadge?.id
                    ? String(primeiraBadge.id)
                    : Number.isFinite(Number(primeiraBadge))
                      ? String(primeiraBadge)
                      : "",
            nova_badge_nome: "",
            nova_badge_descricao: "",
            nova_badge_imagem: null,
            anexo_global_ficheiro: null,
        });

        setEditingTesteId(teste.id);
        setActiveSection("criar");
    };

    const cancelarEdicaoTeste = () => {
        setEditingTesteId(null);
        testeForm.reset();
        testeForm.setData(createTesteFormDefaults());
        setCategoriaFiltro("");
        setTextoPerguntaFiltro("");
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {toastMsg && (
                <div className="fixed bottom-6 right-6 z-[100] flex items-center p-4 space-x-3 w-full max-w-sm text-gray-600 bg-white rounded-xl shadow-2xl dark:text-gray-300 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all duration-300">
                    <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-yellow-500 bg-yellow-100 rounded-lg dark:bg-yellow-900/40 dark:text-yellow-400">
                        <span className="font-bold text-lg">!</span>
                    </div>
                    <div className="ms-3 text-sm font-bold flex-1">
                        {toastMsg}
                    </div>
                    <button
                        type="button"
                        onClick={() => setToastMsg(null)}
                        className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                        <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 14 14"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                    </button>
                </div>
            )}
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
                        Criar Desafio
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
                        perguntasBancoProfessor={perguntasBancoProfessor}
                        perguntasBancoFiltros={perguntasBancoFiltros}
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
                        badgesProfessor={badgesProfessor}
                        categoriaFiltro={categoriaFiltro}
                        setCategoriaFiltro={setCategoriaFiltro}
                        textoPerguntaFiltro={textoPerguntaFiltro}
                        setTextoPerguntaFiltro={setTextoPerguntaFiltro}
                        mostrarApenasMinhasPerguntas={
                            mostrarApenasMinhasPerguntas
                        }
                        setMostrarApenasMinhasPerguntas={
                            setMostrarApenasMinhasPerguntas
                        }
                        mostrarListaPerguntas={mostrarListaPerguntas}
                        setMostrarListaPerguntas={setMostrarListaPerguntas}
                        perguntasFiltradas={perguntasFiltradas}
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
