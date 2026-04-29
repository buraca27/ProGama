import React, { useMemo, useState } from "react";
import { useForm } from "@inertiajs/react";

export default function TarefasView({
    testesProfessor = [],
    turmas = [],
    tarefasProfessor = [],
}) {
    const [showTaskForm, setShowTaskForm] = useState(false);

    const tarefaForm = useForm({
        id_teste: "",
        turma_ids: [],
    });

    const testesDisponiveis = useMemo(
        () => testesProfessor || [],
        [testesProfessor],
    );
    const turmasProfessor = useMemo(() => turmas || [], [turmas]);

    const toggleTurmaSelecionada = (id) => {
        const current = tarefaForm.data.turma_ids || [];
        tarefaForm.setData(
            "turma_ids",
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id],
        );
    };

    const submitTarefa = (e) => {
        e.preventDefault();

        tarefaForm.post(route("professor.tarefas.store"), {
            preserveScroll: true,
            onSuccess: () => {
                tarefaForm.reset();
                tarefaForm.setData("turma_ids", []);
                setShowTaskForm(false);
            },
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Atribuir Tarefas
                    </h3>
                    <button
                        type="button"
                        onClick={() => setShowTaskForm((s) => !s)}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                        {showTaskForm ? "Fechar" : "Nova Tarefa"}
                    </button>
                </div>

                {showTaskForm && (
                    <form onSubmit={submitTarefa} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Escolher teste
                            </label>
                            <select
                                value={tarefaForm.data.id_teste}
                                onChange={(e) =>
                                    tarefaForm.setData(
                                        "id_teste",
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                required
                            >
                                <option value="">Seleciona um teste...</option>
                                {testesDisponiveis.map((teste) => (
                                    <option key={teste.id} value={teste.id}>
                                        {teste.titulo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Atribuir às turmas
                            </label>

                            <div className="max-h-52 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                                {turmasProfessor.length === 0 && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Não tens turmas associadas.
                                    </p>
                                )}
                                {turmasProfessor.map((turma) => (
                                    <label
                                        key={turma.id}
                                        className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={(
                                                tarefaForm.data.turma_ids || []
                                            ).includes(turma.id)}
                                            onChange={() =>
                                                toggleTurmaSelecionada(turma.id)
                                            }
                                        />
                                        <span>{turma.nome}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={tarefaForm.processing}
                            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                            Guardar Tarefa
                        </button>

                        {Object.values(tarefaForm.errors || {}).length > 0 && (
                            <p className="text-sm text-red-600">
                                Não foi possível criar a tarefa. Verifica os
                                campos.
                            </p>
                        )}
                    </form>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Tarefas Criadas
                </h3>

                <div className="space-y-3">
                    {tarefasProfessor.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ainda não criaste nenhuma tarefa.
                        </p>
                    )}

                    {tarefasProfessor.map((tarefa) => (
                        <div
                            key={tarefa.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                        >
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                                {tarefa.teste?.titulo || "Teste"}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Turma: {tarefa.turma?.nome || "-"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Criada em:{" "}
                                {new Date(tarefa.created_at).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
