import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

export default function Show({
    desafio,
    tentativas_restantes,
    submissao_recente,
    anexos_professor = [],
    anexo_global_url = null,
}) {
    const form = useForm({
        ficheiro: null,
        link_submissao: "",
        mensagem_submissao: "",
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route("desafios.submeter-tarefa", desafio.id), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Tarefa - ${desafio?.titulo ?? "Desafio"}`} />

            <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-xs font-semibold uppercase text-slate-500">Tarefa</p>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">{desafio?.titulo}</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {desafio?.descricao}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        Tentativas restantes: {tentativas_restantes}
                    </p>
                </div>

                {(anexo_global_url || anexos_professor.length > 0) && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800 space-y-2">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Materiais do Professor
                        </h2>
                        {anexo_global_url && (
                            <a
                                href={anexo_global_url}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Abrir anexo principal
                            </a>
                        )}
                        {anexos_professor.map((anexo, index) => (
                            <a
                                key={`${anexo.url}-${index}`}
                                href={anexo.url}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-sm text-blue-600 hover:text-blue-700"
                            >
                                {anexo.nome || `Anexo ${index + 1}`}
                            </a>
                        ))}
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
                >
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Submeter ficheiro
                    </label>
                    <input
                        type="file"
                        onChange={(e) =>
                            form.setData("ficheiro", e.target.files?.[0] ?? null)
                        }
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                    />

                    <label className="mt-4 mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Ou enviar link (ex: OneDrive, GitHub, Google Drive)
                    </label>
                    <input
                        type="url"
                        value={form.data.link_submissao}
                        onChange={(e) =>
                            form.setData("link_submissao", e.target.value)
                        }
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                        placeholder="https://..."
                    />

                    <label className="mt-4 mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Mensagem para o professor (opcional)
                    </label>
                    <textarea
                        rows="4"
                        value={form.data.mensagem_submissao}
                        onChange={(e) =>
                            form.setData("mensagem_submissao", e.target.value)
                        }
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                    />

                    {(form.errors.ficheiro || form.errors.link_submissao) && (
                        <p className="mt-2 text-xs text-red-600">
                            {form.errors.ficheiro || form.errors.link_submissao}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={form.processing || tentativas_restantes <= 0}
                        className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
                    >
                        {form.processing ? "A enviar..." : "Submeter Tarefa"}
                    </button>
                </form>

                {submissao_recente && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Ultima submissao
                        </h2>
                        <p className="text-sm text-slate-500">
                            Estado: {submissao_recente.estado}
                        </p>
                        <p className="text-sm text-slate-500">
                            Nota: {submissao_recente.nota ?? "-"}
                        </p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
