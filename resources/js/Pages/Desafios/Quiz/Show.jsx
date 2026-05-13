import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function Show({
    desafio,
    perguntas = [],
    atribuicao,
    tentativas_restantes,
}) {
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const totalPerguntas = useMemo(() => perguntas.length, [perguntas]);

    const setOption = (perguntaId, opcaoId) => {
        setAnswers((prev) => ({ ...prev, [perguntaId]: [opcaoId] }));
    };

    const toggleMultipleOption = (perguntaId, opcaoId) => {
        setAnswers((prev) => {
            const current = prev[perguntaId] || [];
            const hasOption = current.includes(opcaoId);

            return {
                ...prev,
                [perguntaId]: hasOption
                    ? current.filter((id) => id !== opcaoId)
                    : [...current, opcaoId],
            };
        });
    };

    const submitQuiz = () => {
        setSubmitting(true);
        router.post(
            route("desafios.submeter-quiz", desafio.id),
            {
                id_atribuicao: atribuicao?.id,
                respostas: answers,
            },
            {
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Quiz - ${desafio?.titulo ?? "Desafio"}`} />

            <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                        Quiz
                    </p>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                        {desafio?.titulo}
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        {desafio?.descricao}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        {totalPerguntas} perguntas • {tentativas_restantes}{" "}
                        tentativas restantes
                    </p>
                </div>

                {perguntas.map((p, idx) => {
                    const isMultipleChoice =
                        p.tipo_pergunta === "Escolha_Multipla";
                    const selectedOptions = answers[p.id] || [];

                    return (
                        <div
                            key={p.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
                        >
                            <p className="text-xs font-semibold text-slate-500">
                                Pergunta {idx + 1}
                            </p>
                            <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                                {p.texto}
                            </p>

                            <div className="mt-3 space-y-2">
                                {(p.opcoes ?? []).map((o) => {
                                    const isChecked = isMultipleChoice
                                        ? selectedOptions.includes(o.id)
                                        : selectedOptions[0] === o.id;

                                    return (
                                        <label
                                            key={o.id}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                                        >
                                            <input
                                                type={
                                                    isMultipleChoice
                                                        ? "checkbox"
                                                        : "radio"
                                                }
                                                name={
                                                    isMultipleChoice
                                                        ? undefined
                                                        : `p-${p.id}`
                                                }
                                                checked={isChecked}
                                                onChange={() =>
                                                    isMultipleChoice
                                                        ? toggleMultipleOption(
                                                              p.id,
                                                              o.id,
                                                          )
                                                        : setOption(p.id, o.id)
                                                }
                                            />
                                            <span>
                                                {o.texto_opcao ??
                                                    o.texto ??
                                                    `Opcao ${o.id}`}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                <button
                    onClick={submitQuiz}
                    disabled={submitting}
                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
                >
                    {submitting ? "A submeter..." : "Submeter Quiz"}
                </button>
            </div>
        </AuthenticatedLayout>
    );
}
