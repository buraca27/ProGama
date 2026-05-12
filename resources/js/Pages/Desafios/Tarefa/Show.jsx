import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

export default function Show({ desafio, tentativas_restantes, submissao_recente }) {
    const form = useForm({
        ficheiro: null,
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
                    <p className="text-sm text-slate-600 dark:text-slate-300">{desafio?.descricao}</p>
                    <p className="mt-2 text-sm text-slate-500">Tentativas restantes: {tentativas_restantes}</p>
                </div>

                <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Submeter ficheiro</label>
                    <input
                        type="file"
                        onChange={(e) => form.setData("ficheiro", e.target.files?.[0] ?? null)}
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                    />

                    {form.errors.ficheiro && (
                        <p className="mt-2 text-xs text-red-600">{form.errors.ficheiro}</p>
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
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ultima submissao</h2>
                        <p className="text-sm text-slate-500">Estado: {submissao_recente.estado}</p>
                        <p className="text-sm text-slate-500">Nota: {submissao_recente.nota ?? "-"}</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
