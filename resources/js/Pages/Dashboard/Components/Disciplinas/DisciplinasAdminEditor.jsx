import React, { useState } from "react";
import { router } from "@inertiajs/react";

export default function DisciplinasAdminEditor({ disciplina, utilizadores, turmas }) {
    const todosProfessores = utilizadores.filter((u) => u.id_role === 2);

    const [selectedTurmas, setSelectedTurmas] = useState(
        disciplina.turmas?.map((t) => t.id) || [],
    );
    const [selectedProfs, setSelectedProfs] = useState(
        disciplina.professores?.map((p) => p.id) || [],
    );
    const [profSearch, setProfSearch] = useState("");
    const [turmaSearch, setTurmaSearch] = useState("");

    const filteredProfessores = todosProfessores.filter((p) => {
        const search = profSearch.toLowerCase();
        return (
            (p.name || "").toLowerCase().includes(search) ||
            (p.email || "").toLowerCase().includes(search)
        );
    });

    const filteredTurmas = turmas.filter((t) => {
        const search = turmaSearch.toLowerCase();
        return (
            (t.nome || "").toLowerCase().includes(search) ||
            String(t.ano_letivo || "").toLowerCase().includes(search)
        );
    });

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
        <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coluna Professores */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold mb-3 text-gray-800 dark:text-gray-200">
                        Docentes Associados ({selectedProfs.length})
                    </h4>
                    <input
                        type="text"
                        value={profSearch}
                        onChange={(e) => setProfSearch(e.target.value)}
                        placeholder="Pesquisar docente por nome ou email..."
                        className="w-full mb-3 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {filteredProfessores.length > 0 ? filteredProfessores.map((p) => (
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
                                <span className="flex-1 truncate">{p.name}</span>
                            </label>
                        )) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">Nenhum docente encontrado para essa pesquisa.</p>
                        )}
                    </div>
                </div>

                {/* Coluna Turmas */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold mb-3 text-gray-800 dark:text-gray-200">
                        Turmas Associadas ({selectedTurmas.length})
                    </h4>
                    <input
                        type="text"
                        value={turmaSearch}
                        onChange={(e) => setTurmaSearch(e.target.value)}
                        placeholder="Pesquisar turma por nome ou ano..."
                        className="w-full mb-3 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {filteredTurmas.length > 0 ? filteredTurmas.map((t) => (
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
                                <span className="flex-1 truncate">{t.nome} <span className="text-xs text-gray-500">({t.ano_letivo})</span></span>
                            </label>
                        )) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">Nenhuma turma encontrada para essa pesquisa.</p>
                        )}
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
