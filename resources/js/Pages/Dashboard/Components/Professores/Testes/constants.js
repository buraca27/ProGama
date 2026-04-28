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
});

export const createNovaPerguntaTesteDefaults = () => ({
    ...createPerguntaFormDefaults(),
    pontuacao: 1,
});
