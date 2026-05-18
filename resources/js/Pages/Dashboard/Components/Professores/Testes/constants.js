export const TIPO_PERGUNTA_OPTIONS = [
    { value: "Dissertativa", label: "Desenvolvimento" },
    { value: "Escolha_Multipla", label: "Escolha Múltipla" },
    { value: "Verdadeiro_Falso", label: "Verdadeiro ou Falso" },
];

export const TIPO_DESAFIO_OPTIONS = [
    { value: "Quiz", label: "Quiz" },
    { value: "Tarefa", label: "Tarefa" },
];

export const createPerguntaFormDefaults = () => ({
    texto: "",
    tipo_pergunta: "Dissertativa",
    id_categoria: "",
    url_anexo_pergunta: null,
    opcoes: ["", ""],
    resposta_correta_index: 0,
    resposta_correta_indices: [0],
    resposta_verdadeiro_falso: true,
});

export const createTesteFormDefaults = () => ({
    titulo: "",
    tipo_avaliacao: "Desafio",
    tipo_desafio: "Quiz",
    peso_avaliacao: "0",
    duracao_minutos: "",
    pergunta_ids: [],
    pontuacao_por_pergunta: {},
    novas_perguntas: [],
    instrucoes: "",
    xp_base: 1,
    auto_award_xp: true,
    badge_existente_id: "",
    nova_badge_nome: "",
    nova_badge_descricao: "",
    nova_badge_imagem: null,
    nova_badge_raridade: "1",
    anexo_global_ficheiro: null,
    anexos_professor_ficheiros: [],
});

export const createNovaPerguntaTesteDefaults = () => ({
    ...createPerguntaFormDefaults(),
    pontuacao: 1,
});

export const CONTEXTO_AVALIACAO = {
    Desafio: {
        nome: "Desafio",
        placeholderTitulo: "Ex: Desafio de Logica - Semana 3",
        temInstrucoes: true,
        escalaFixa20: true,
        semPesoNota: true,
    },
};
