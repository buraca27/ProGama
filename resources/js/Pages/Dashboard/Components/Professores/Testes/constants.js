export const TIPO_PERGUNTA_OPTIONS = [
    { value: "Dissertativa", label: "Desenvolvimento" },
    { value: "Escolha_Multipla", label: "Escolha Múltipla" },
    { value: "Verdadeiro_Falso", label: "Verdadeiro ou Falso" },
];

export const TIPO_AVALIACAO_OPTIONS = [
    { value: "Teste_Formal", label: "Teste Formal" },
    { value: "Ficha_Trabalho", label: "Ficha de Trabalho" },
    { value: "Exame_Final", label: "Exame Final" },
];

export const createPerguntaFormDefaults = () => ({
    texto: "",
    tipo_pergunta: "Dissertativa",
    id_categoria: "",
    url_anexo_pergunta: null,
    opcoes: ["", ""],
    resposta_correta_index: 0,
    resposta_verdadeiro_falso: true,
});

export const createTesteFormDefaults = () => ({
    titulo: "",
    tipo_avaliacao: "Teste_Formal",
    data_hora_abertura: "",
    data_hora_fecho: "",
    duracao_minutos: "",
    pergunta_ids: [],
    pontuacao_por_pergunta: {},
    novas_perguntas: [],
    instrucoes: "",
});

export const createNovaPerguntaTesteDefaults = () => ({
    ...createPerguntaFormDefaults(),
    pontuacao: 1,
});

export const CONTEXTO_AVALIACAO = {
    Ficha_Trabalho: {
        nome: "Ficha de Trabalho",
        placeholderTitulo: "Ex: Ficha de Trabalho - HTML",
        temInstrucoes: true,
        temDuracaoEAbertura: false,
        labelFecho: "Data Limite de Entrega (Opcional)",
        fechoObrigatorio: false,
        escalaFixa20: false,
    },
    Teste_Formal: {
        nome: "Teste",
        placeholderTitulo: "Ex: Teste de Programação - Módulo 1",
        temInstrucoes: false,
        temDuracaoEAbertura: true,
        labelFecho: "Fecho",
        fechoObrigatorio: true,
        escalaFixa20: true,
    },
    Exame_Final: {
        nome: "Exame",
        placeholderTitulo: "Ex: Exame Final - Época Normal",
        temInstrucoes: true,
        temDuracaoEAbertura: true,
        labelFecho: "Fecho",
        fechoObrigatorio: true,
        escalaFixa20: true,
    },
};
