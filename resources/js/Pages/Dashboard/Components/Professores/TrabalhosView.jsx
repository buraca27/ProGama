import React from "react";

export default function TrabalhosView({ tarefasAluno = [] }) {
    const tarefas = Array.isArray(tarefasAluno) ? tarefasAluno : [];

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Trabalhos Pendentes
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Aqui aparecem os teus trabalhos e testes atribuidos.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                {tarefas.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Nao tens trabalhos pendentes neste momento.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {tarefas.map((tarefa, index) => (
                            <div
                                key={tarefa.id || `${tarefa.id_teste || "t"}-${index}`}
                                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                            >
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                    {tarefa.teste?.titulo || tarefa.titulo || "Trabalho"}
                                </p>
                                {tarefa.turma?.nome && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        Turma: {tarefa.turma.nome}
                                    </p>
                                )}
                                {tarefa.teste?.data_hora_fecho && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Prazo: {String(tarefa.teste.data_hora_fecho).replace("T", " ")}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
