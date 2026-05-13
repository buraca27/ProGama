import { useEffect, useRef, useState } from "react";
import { useForm, router } from "@inertiajs/react";

function formatDateTime(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getPerguntas(desafio) {
    if (!desafio) return [];
    if (Array.isArray(desafio.perguntas) && desafio.perguntas.length > 0) return desafio.perguntas;
    return desafio.teste_associado?.perguntas || [];
}

export default function DesafioModal({ atribuicao, inscricao, onClose, returnView }) {
    const desafio = atribuicao?.desafio || null;
    const perguntas = getPerguntas(desafio);
    const semConsulta = !!(atribuicao?.sem_consulta);

    // --- Timer ---
    const duracaoSegundos = desafio?.duracao_minutos ? desafio.duracao_minutos * 60 : null;
    const storageKey = atribuicao?.id ? `desafio_start_${atribuicao.id}` : null;

    // Calculates and persists the start reference in sessionStorage so the timer
    // survives accidental modal closes and reopens within the same browser session.
    const [startTime] = useState(() => {
        if (inscricao?.data_inicio_resolucao) {
            if (storageKey) sessionStorage.removeItem(storageKey);
            return new Date(inscricao.data_inicio_resolucao).getTime();
        }
        if (storageKey) {
            const stored = sessionStorage.getItem(storageKey);
            if (stored) return parseInt(stored, 10);
            const now = Date.now();
            sessionStorage.setItem(storageKey, String(now));
            return now;
        }
        return Date.now();
    });

    const [tempoRestante, setTempoRestante] = useState(() => {
        if (!duracaoSegundos) return null;
        return Math.max(0, duracaoSegundos - Math.floor((Date.now() - startTime) / 1000));
    });

    useEffect(() => {
        if (duracaoSegundos === null) return;
        const intervalo = setInterval(() => {
            setTempoRestante(Math.max(0, duracaoSegundos - Math.floor((Date.now() - startTime) / 1000)));
        }, 1000);
        return () => clearInterval(intervalo);
    }, [duracaoSegundos, startTime]);

    // --- Deteção de troca de aba/janela ---
    const [tabSwitches, setTabSwitches] = useState(0);
    const lastSwitchRef = useRef(0);

    useEffect(() => {
        document.body.style.overflow = "hidden";

        const recordSwitch = () => {
            const now = Date.now();
            // Debounce 500ms para evitar duplicação entre visibilitychange e blur
            if (now - lastSwitchRef.current > 500) {
                lastSwitchRef.current = now;
                setTabSwitches((prev) => prev + 1);
            }
        };

        const onVisibility = () => { if (document.hidden) recordSwitch(); };
        const onBlur = () => recordSwitch();

        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("blur", onBlur);

        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("visibilitychange", onVisibility);
            window.removeEventListener("blur", onBlur);
        };
    }, []);

    // --- Toast ---
    const [toastMsg, setToastMsg] = useState(null);
    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 4000);
    };

    // --- Form ---
    const form = useForm({ respostas: {} });

    useEffect(() => {
        if (!atribuicao) return;
        const respostasExistentes = new Map(
            (inscricao?.respostas || []).map((r) => [Number(r.id_pergunta), r]),
        );
        const iniciais = {};
        getPerguntas(atribuicao.desafio).forEach((pergunta) => {
            const existente = respostasExistentes.get(Number(pergunta.id));
            iniciais[pergunta.id] = {
                id_pergunta: Number(pergunta.id),
                id_opcao_escolhida: existente?.id_opcao_escolhida
                    ? Number(existente.id_opcao_escolhida)
                    : null,
                ids_opcoes_escolhidas: Array.isArray(existente?.ids_opcoes_escolhidas)
                    ? existente.ids_opcoes_escolhidas.map((id) => Number(id))
                    : [],
                resposta_texto: existente?.resposta_texto || "",
            };
        });
        form.setData("respostas", iniciais);
    }, [atribuicao, inscricao]);

    const now = new Date();
    const abriu = desafio?.data_inicio ? new Date(desafio.data_inicio) : null;
    const fechou = desafio?.data_fim ? new Date(desafio.data_fim) : null;
    const bloqueadoPorData = (abriu && now < abriu) || (fechou && now > fechou);
    const desafioFechado = Boolean(
        inscricao && ["Avaliado", "Concluido"].includes(inscricao.estado),
    );
    const tempoEsgotado = tempoRestante !== null && tempoRestante <= 0;
    const podeInteragir = !!atribuicao
        && perguntas.length > 0
        && !bloqueadoPorData
        && !tempoEsgotado
        && !desafioFechado;

    const percentagemTempo = duracaoSegundos ? tempoRestante / duracaoSegundos : 1;
    const corTimer =
        tempoEsgotado || percentagemTempo < 0.1
            ? "text-red-600 dark:text-red-400"
            : percentagemTempo < 0.25
            ? "text-orange-500 dark:text-orange-400"
            : "text-gray-700 dark:text-gray-200";
    const bgTimer =
        tempoEsgotado || percentagemTempo < 0.1
            ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
            : percentagemTempo < 0.25
            ? "border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20"
            : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60";

    const formatarTimer = (seg) => {
        const m = Math.floor(seg / 60);
        const s = seg % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const onSelectOption = (idPergunta, idOpcao) => {
        const prev = form.data.respostas || {};
        form.setData("respostas", {
            ...prev,
            [idPergunta]: {
                ...(prev[idPergunta] || { id_pergunta: Number(idPergunta), resposta_texto: "" }),
                id_opcao_escolhida: Number(idOpcao),
                ids_opcoes_escolhidas: [Number(idOpcao)],
            },
        });
    };

    const onChangeTexto = (idPergunta, value) => {
        const prev = form.data.respostas || {};
        form.setData("respostas", {
            ...prev,
            [idPergunta]: {
                ...(prev[idPergunta] || { id_pergunta: Number(idPergunta), id_opcao_escolhida: null }),
                resposta_texto: value,
            },
        });
    };

    const buildPayload = () =>
        getPerguntas(desafio).map((pergunta) => {
            const r = form.data.respostas?.[pergunta.id] || {};
            return {
                id_pergunta: Number(pergunta.id),
                id_opcao_escolhida: r.id_opcao_escolhida || null,
                ids_opcoes_escolhidas: r.ids_opcoes_escolhidas || [],
                resposta_texto: r.resposta_texto || "",
            };
        });

    const handleGuardarRascunho = () => {
        if (!atribuicao) return;
        form.clearErrors();
        router.post(
            route("aluno.desafios.submeter", atribuicao.id),
            { respostas: buildPayload(), finalizar: false, tab_switches: tabSwitches },
            {
                preserveScroll: true,
                onSuccess: () => showToast("Rascunho guardado com sucesso."),
                onError: (erros) => {
                    form.setError(erros);
                    showToast("Erro ao guardar! Verifica os avisos.");
                },
            },
        );
    };

    const handleSubmeterFinal = () => {
        if (!atribuicao) return;
        form.clearErrors();
        router.post(
            route("aluno.desafios.submeter", atribuicao.id),
            {
                respostas: buildPayload(),
                finalizar: true,
                tab_switches: tabSwitches,
                return_view: returnView || "dashboard",
            },
            {
                onError: (erros) => form.setError(erros),
                onSuccess: () => {
                    if (storageKey) sessionStorage.removeItem(storageKey);
                },
            },
        );
    };

    if (!atribuicao) {
        return (
            <>
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                    <div className="pointer-events-auto bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <p className="text-gray-700 dark:text-gray-200">Desafio não encontrado ou não atribuído a ti.</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Toast */}
            {toastMsg && (
                <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 p-4 max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 font-bold text-lg">
                        ✓
                    </div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex-1">{toastMsg}</p>
                    <button onClick={() => setToastMsg(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
                </div>
            )}

            {/* Backdrop — sem onClick para evitar fechar acidentalmente */}
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />

            {/* Painel */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="pointer-events-auto relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Cabeçalho */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                Desafio
                            </p>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white truncate">
                                {desafio?.titulo || "Desafio"}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            {tempoRestante !== null && (
                                <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 tabular-nums text-sm font-bold ${bgTimer}`}>
                                    <span>⏱</span>
                                    <span className={corTimer}>
                                        {formatarTimer(tempoRestante)}
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Aviso de trocas de aba */}
                    {semConsulta && tabSwitches === 0 && (
                        <div className="flex items-center gap-2 px-6 py-2.5 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex-shrink-0">
                            <span>🚫</span>
                            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                                Este teste é <strong>sem consulta</strong>. Não mudes de aba ou janela — as trocas são registadas e podem resultar na anulação automática.
                            </p>
                        </div>
                    )}
                    {semConsulta && tabSwitches > 0 && (
                        <div className="flex items-center gap-2 px-6 py-2.5 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex-shrink-0">
                            <span>🚨</span>
                            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                                ATENÇÃO — Foi detetada uma troca de aba/janela. Este teste é sem consulta — as trocas são registadas e podem resultar na anulação da submissão.
                            </p>
                        </div>
                    )}

                    {/* Corpo com scroll */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                        {/* Info do desafio */}
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            {desafio?.descricao && (
                                <p className="whitespace-pre-line bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-700 dark:text-gray-200">
                                    {desafio.descricao}
                                </p>
                            )}
                            <p>
                                Janela:{" "}
                                <span className="font-medium text-gray-800 dark:text-gray-100">
                                    {formatDateTime(desafio?.data_inicio)} — {formatDateTime(desafio?.data_fim)}
                                </span>
                            </p>
                            {desafio?.duracao_minutos && (
                                <p>
                                    Duração máxima por tentativa:{" "}
                                    <span className="font-medium text-gray-800 dark:text-gray-100">
                                        {desafio.duracao_minutos} min
                                    </span>
                                </p>
                            )}
                        </div>

                        {bloqueadoPorData && (
                            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
                                Este desafio está fora da janela de resolução.
                            </div>
                        )}

                        {tempoEsgotado && (
                            <div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-300">
                                ⏰ O tempo limite foi atingido. Já não é possível submeter.
                            </div>
                        )}

                        {desafioFechado && (
                            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                Este desafio já foi corrigido e fechado pelo professor. Não podes submeter novamente.
                            </div>
                        )}

                        {inscricao?.estado === "Em_Resolucao" && (
                            <div className="flex items-center gap-2 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-4 py-3 text-sm text-violet-700 dark:text-violet-300">
                                <span className="font-semibold">Rascunho guardado.</span>
                                <span>As tuas respostas foram carregadas automaticamente.</span>
                            </div>
                        )}

                        {(form.errors.desafio || form.errors.respostas) && (
                            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                                {form.errors.desafio || form.errors.respostas}
                            </div>
                        )}

                        {perguntas.length === 0 && !bloqueadoPorData && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Este desafio não tem perguntas configuradas.
                            </p>
                        )}

                        {/* Perguntas */}
                        <div className="space-y-4">
                            {perguntas.map((pergunta, index) => {
                                const resposta = form.data.respostas?.[pergunta.id] || {};
                                return (
                                    <div
                                        key={pergunta.id}
                                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-4"
                                    >
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                            Pergunta {index + 1}
                                        </p>
                                        <h4 className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                                            {pergunta.texto}
                                        </h4>

                                        {pergunta.url_anexo_pergunta && (
                                            <img
                                                src={pergunta.url_anexo_pergunta}
                                                alt="Anexo"
                                                className="mt-3 max-h-48 rounded-lg object-contain border border-gray-200 dark:border-gray-700"
                                            />
                                        )}

                                        {pergunta.tipo_pergunta === "Dissertativa" ? (
                                            <textarea
                                                value={resposta.resposta_texto || ""}
                                                onChange={(e) => onChangeTexto(pergunta.id, e.target.value)}
                                                rows={4}
                                                disabled={!podeInteragir || form.processing}
                                                placeholder="Escreve a tua resposta..."
                                                className="mt-3 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500 disabled:opacity-60"
                                            />
                                        ) : (
                                            <div className="mt-3 space-y-2">
                                                {(pergunta.opcoes || []).map((opcao) => {
                                                    const checked =
                                                        Number(resposta.id_opcao_escolhida) === Number(opcao.id);
                                                    return (
                                                        <label
                                                            key={opcao.id}
                                                            className={`flex items-start gap-3 rounded-lg border px-3 py-2 transition ${
                                                                checked
                                                                    ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
                                                                    : "border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800/60"
                                                            } ${!podeInteragir ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`modal_p_${pergunta.id}`}
                                                                checked={checked}
                                                                onChange={() => onSelectOption(pergunta.id, opcao.id)}
                                                                disabled={!podeInteragir || form.processing}
                                                                className="mt-0.5 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-700 dark:text-gray-200">
                                                                {opcao.texto_opcao}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Rodapé */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex-shrink-0">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {inscricao?.data_ultima_tentativa &&
                                ["Submetido", "Concluido"].includes(inscricao?.estado) && (
                                    <span>
                                        Última submissão: {formatDateTime(inscricao.data_ultima_tentativa)}
                                    </span>
                                )}
                        </div>
                        {podeInteragir && (
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleGuardarRascunho}
                                    disabled={form.processing}
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-60 transition"
                                >
                                    {form.processing ? "A guardar..." : "Guardar rascunho"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmeterFinal}
                                    disabled={form.processing}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-60 transition"
                                >
                                    {form.processing ? "A submeter..." : "Submeter desafio"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
