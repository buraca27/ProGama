import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";

export default function DisciplinasAdminEditor({ disciplina, utilizadores, turmas }) {
    // Filtramos apenas os professores
    const todosProfessores = utilizadores.filter((u) => u.id_role === 2);

    const [selectedTurmas, setSelectedTurmas] = useState(
        disciplina.turmas?.map((t) => t.id) || [],
    );
    const [selectedProfs, setSelectedProfs] = useState(
        disciplina.professores?.map((p) => p.id) || [],
    );

    const handleSave = () => {
    router.post(
        `/dashboard/disciplinas/${disciplina.id}/assign`,
        {
            turmas: selectedTurmas,        // era turmas_ids
            professores: selectedProfs,    // era professores_ids
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
        <div className="mt-4">
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

                {/* Coluna Turmas */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold mb-3 text-gray-800 dark:text-gray-200">
                        Turmas Associadas
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {turmas.map((t) => (
                            <label
                                key={t.id}
                                className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded cursor-pointer transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTurmas.includes(t.id)}
                                    onChange={() =>
                                        toggleSelection(
                                            t.id,
                                            selectedTurmas,
                                            setSelectedTurmas,
                                        )
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
                                />
                                <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                                    T
                                </div>
                                <span>{t.nome} <span className="text-xs text-gray-500">({t.ano_letivo})</span></span>
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