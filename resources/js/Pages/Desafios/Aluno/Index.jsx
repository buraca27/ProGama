import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

const filtros = [
    { key: "todos", label: "Todos" },
    { key: "quiz", label: "Quiz" },
    { key: "tarefa", label: "Tarefa" },
    { key: "ativos", label: "Ativos" },
    { key: "concluidos", label: "Concluidos" },
];

export default function Index({ desafios, filtro_atual, xp_usuario, nivel_usuario }) {
    return (
        <AuthenticatedLayout>
            <Head title="Desafios" />

            <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Desafios Unificados</h1>
                    <p className="text-sm text-slate-500">Nivel {nivel_usuario} • {xp_usuario} XP</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {filtros.map((f) => (
                        <Link
                            key={f.key}
                            href={route("desafios.index", { filtro: f.key })}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold ${filtro_atual === f.key ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"}`}
                        >
                            {f.label}
                        </Link>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {(desafios?.data ?? []).map((d) => (
                        <Link
                            key={d.id}
                            href={route("desafios.show", d.id)}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                        >
                            <p className="text-xs font-semibold uppercase text-slate-500">{d.tipo_desafio}</p>
                            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{d.titulo}</h2>
                            <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{d.descricao}</p>
                            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                <span>Status: {d.status_usuario}</span>
                                <span>Nota: {d.nota_obtida ?? "-"}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
