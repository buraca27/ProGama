// resources/js/Pages/Dashboard/Partials/TurmaAdminEditor.jsx
import React, { useState } from "react";
import { router } from "@inertiajs/react";

export default function TurmaAdminEditor({ turma, utilizadores }) {
    const todosAlunos = utilizadores.filter((u) => u.id_role === 3);
    const todosProfessores = utilizadores.filter((u) => u.id_role === 2);

    const [selectedAlunos, setSelectedAlunos] = useState(
        turma.alunos?.map((a) => a.id) || [],
    );
    const [selectedProfs, setSelectedProfs] = useState(
        turma.professores?.map((p) => p.id) || [],
    );

    const handleSave = () => {
        router.post(
            `/dashboard/turmas/${turma.id}/assign`,
            {
                alunos_ids: selectedAlunos,
                professores_ids: selectedProfs,
            },
            { preserveScroll: true },
        );
    };

    const toggleSelection = (id, list, setList) => {
        if (list.includes(id)) {
            setList(list.filter((item) => item !== id));
        } else {
            setList([...list, id]);
        }
    };

    return (
        <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coluna Professores */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold mb-3 text-gray-800 dark:text-gray-200">
                        Docentes Associados
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {todosProfessores.map((p) => (
                            <label
                                key={p.id}
                                className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded cursor-pointer transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedProfs.includes(p.id)}
                                    onChange={() =>
                                        toggleSelection(
                                            p.id,
                                            selectedProfs,
                                            setSelectedProfs,
                                        )
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
                                />
                                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center overflow-hidden text-xs font-bold">
                                    {p.foto_perfil ? (
                                        <img
                                            src={p.foto_perfil}
                                            className="w-full h-full object-cover"
                                            alt="img"
                                        />
                                    ) : (
                                        p.name.charAt(0)
                                    )}
                                </div>
                                <span>{p.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Coluna Alunos */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold mb-3 text-gray-800 dark:text-gray-200">
                        Alunos Inscritos
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {todosAlunos.map((a) => (
                            <label
                                key={a.id}
                                className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded cursor-pointer transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedAlunos.includes(a.id)}
                                    onChange={() =>
                                        toggleSelection(
                                            a.id,
                                            selectedAlunos,
                                            setSelectedAlunos,
                                        )
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
                                />
                                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center overflow-hidden text-xs font-bold">
                                    {a.foto_perfil ? (
                                        <img
                                            src={a.foto_perfil}
                                            className="w-full h-full object-cover"
                                            alt="img"
                                        />
                                    ) : (
                                        a.name.charAt(0)
                                    )}
                                </div>
                                <span>{a.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <button
                onClick={handleSave}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors w-full md:w-auto shadow-sm"
            >
                Guardar Atribuições
            </button>
        </div>
    );
}
