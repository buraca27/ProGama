// resources/js/Pages/Dashboard/Partials/TurmaAdminEditor.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { router } from "@inertiajs/react";
import Modal from "@/Components/Modal";

function InfoTooltip({ person, role }) {
    const [pos, setPos] = useState(null);
    const isAluno = role === "aluno";

    return (
        <div
            className="shrink-0 ml-auto"
            onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setPos({ top: rect.top, left: rect.left });
            }}
            onMouseLeave={() => setPos(null)}
        >
            <span className="text-gray-400 hover:text-blue-500 cursor-default select-none text-sm">ⓘ</span>
            {pos && (
                <div
                    style={{
                        position: "fixed",
                        top: Math.max(8, pos.top - 140),
                        left: Math.max(8, pos.left - 200),
                        zIndex: 9999,
                    }}
                    className="w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-3 pointer-events-none"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden ${isAluno ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"}`}>
                            {person.foto_perfil
                                ? <img src={person.foto_perfil} className="w-full h-full object-cover" alt="" />
                                : person.name.charAt(0)
                            }
                        </div>
                        <span className="font-bold text-gray-900 dark:text-gray-100 text-xs truncate">{person.name}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{person.email}</p>
                    {(person.nmr_processo_interno || person.numero_interno) && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1"># {person.nmr_processo_interno ?? person.numero_interno}</p>
                    )}
                    <span className={`mt-2 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isAluno ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/40" : "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40"}`}>
                        {isAluno ? "Aluno" : "Docente"}
                    </span>
                </div>
            )}
        </div>
    );
}

function InfoTooltip({ person, role }) {
    const [pos, setPos] = useState(null);
    const isAluno = role === "aluno";

    return (
        <div
            className="shrink-0 ml-auto"
            onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setPos({ top: rect.top, left: rect.left });
            }}
            onMouseLeave={() => setPos(null)}
        >
            <span className="text-gray-400 hover:text-blue-500 cursor-default select-none text-sm">ⓘ</span>
            {pos && (
                <div
                    style={{
                        position: "fixed",
                        top: Math.max(8, pos.top - 140),
                        left: Math.max(8, pos.left - 200),
                        zIndex: 9999,
                    }}
                    className="w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-3 pointer-events-none"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden ${isAluno ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"}`}>
                            {person.foto_perfil
                                ? <img src={person.foto_perfil} className="w-full h-full object-cover" alt="" />
                                : person.name.charAt(0)
                            }
                        </div>
                        <span className="font-bold text-gray-900 dark:text-gray-100 text-xs truncate">{person.name}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{person.email}</p>
                    {(person.nmr_processo_interno || person.numero_interno) && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1"># {person.nmr_processo_interno ?? person.numero_interno}</p>
                    )}
                    <span className={`mt-2 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isAluno ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/40" : "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40"}`}>
                        {isAluno ? "Aluno" : "Docente"}
                    </span>
                </div>
            )}
        </div>
    );
}

export default function TurmaAdminEditor({ turma, utilizadores }) {
    const editorKey = `turma-${turma.id}`;
    const buildSelectionKey = (items) => [...items].sort((a, b) => a - b).join(",");
    const todosAlunos = utilizadores.filter((u) => u.id_role === 3);
    const todosProfessores = utilizadores.filter((u) => u.id_role === 2);

    const [selectedAlunos, setSelectedAlunos] = useState(
        turma.alunos?.map((a) => a.id) || [],
    );
    const [selectedProfs, setSelectedProfs] = useState(
        turma.professores?.map((p) => p.id) || [],
    );
    const [alunoSearch, setAlunoSearch] = useState("");
    const [docenteSearch, setDocenteSearch] = useState("");
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [savedProfsKey, setSavedProfsKey] = useState(
        buildSelectionKey(turma.professores?.map((p) => p.id) || []),
    );
    const [savedAlunosKey, setSavedAlunosKey] = useState(
        buildSelectionKey(turma.alunos?.map((a) => a.id) || []),
    );
    const pendingVisitRef = useRef(null);
    const shouldBypassGuardRef = useRef(false);

    const filteredAlunos = todosAlunos.filter((a) => {
        const search = alunoSearch.toLowerCase();
        const safeName = (a.name || "").toLowerCase();
        const safeEmail = (a.email || "").toLowerCase();
        const safeNumeroInterno = String(
            a.nmr_processo_interno ?? a.numero_interno ?? "",
        ).toLowerCase();

        return (
            safeName.includes(search) ||
            safeEmail.includes(search) ||
            safeNumeroInterno.includes(search)
        );
    });

    const filteredProfessores = todosProfessores.filter((p) => {
        const search = docenteSearch.toLowerCase();
        const safeName = (p.name || "").toLowerCase();
        const safeEmail = (p.email || "").toLowerCase();
        return safeName.includes(search) || safeEmail.includes(search);
    });

    const isDirty =
        buildSelectionKey(selectedProfs) !== savedProfsKey ||
        buildSelectionKey(selectedAlunos) !== savedAlunosKey;

    useEffect(() => {
        setSavedProfsKey(buildSelectionKey(turma.professores?.map((p) => p.id) || []));
        setSavedAlunosKey(buildSelectionKey(turma.alunos?.map((a) => a.id) || []));
    }, [turma.alunos, turma.professores]);

    useEffect(() => {
        if (!isDirty) return;

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };

        const handleInertiaBefore = (event) => {
            if (shouldBypassGuardRef.current) {
                shouldBypassGuardRef.current = false;
                return;
            }

            if ((event.detail.visit.method || "get").toLowerCase() !== "get") {
                return;
            }

            event.preventDefault();
            pendingVisitRef.current = event.detail.visit;
            setShowUnsavedModal(true);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('inertia:before', handleInertiaBefore);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('inertia:before', handleInertiaBefore);
        };
    }, [isDirty]);

    useEffect(() => {
        if (!isDirty) {
            pendingVisitRef.current = null;
            setShowUnsavedModal(false);
        }
    }, [isDirty]);

    useEffect(() => {
        window.dispatchEvent(
            new CustomEvent("dashboard:editor-dirty", {
                detail: {
                    editorKey,
                    isDirty,
                    label: `turma ${turma.nome}`,
                },
            }),
        );

        return () => {
            window.dispatchEvent(
                new CustomEvent("dashboard:editor-dirty", {
                    detail: {
                        editorKey,
                        isDirty: false,
                        label: `turma ${turma.nome}`,
                    },
                }),
            );
        };
    }, [editorKey, isDirty, turma.nome]);

    const handleSave = () => {
        shouldBypassGuardRef.current = true;
        router.post(
            `/dashboard/turmas/${turma.id}/assign`,
            {
                alunos_ids: selectedAlunos,
                professores_ids: selectedProfs,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSavedProfsKey(buildSelectionKey(selectedProfs));
                    setSavedAlunosKey(buildSelectionKey(selectedAlunos));
                },
            },
        );
    };

    const toggleSelection = (id, list, setList) => {
        if (list.includes(id)) {
            setList(list.filter((item) => item !== id));
        } else {
            setList([...list, id]);
        }
    };

    const discardChangesAndLeave = () => {
        const pendingVisit = pendingVisitRef.current;

        setShowUnsavedModal(false);
        pendingVisitRef.current = null;

        if (!pendingVisit) {
            return;
        }

        shouldBypassGuardRef.current = true;
        router.visit(pendingVisit.url, pendingVisit);
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
                        value={docenteSearch}
                        onChange={(e) => setDocenteSearch(e.target.value)}
                        placeholder="Pesquisar docente por nome ou email..."
                        className="w-full mb-3 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {filteredProfessores.length > 0 ? (
                            filteredProfessores.map((p) => (
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
                                    <InfoTooltip person={p} role="docente" />
                                </label>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">
                                Nenhum docente encontrado para essa pesquisa.
                            </p>
                        )}
                    </div>
                </div>

                {/* Coluna Alunos */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold mb-3 text-gray-800 dark:text-gray-200">
                        Alunos Inscritos ({selectedAlunos.length})
                    </h4>
                    <input
                        type="text"
                        value={alunoSearch}
                        onChange={(e) => setAlunoSearch(e.target.value)}
                        placeholder="Pesquisar aluno por nome, email ou n. interno..."
                        className="w-full mb-3 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {filteredAlunos.length > 0 ? (
                            filteredAlunos.map((a) => (
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
                                    <span className="flex-1 truncate">{a.name}</span>
                                    <InfoTooltip person={a} role="aluno" />
                                </label>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">
                                Nenhum aluno encontrado para essa pesquisa.
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <button
                onClick={handleSave}
                disabled={!isDirty}
                className={`mt-4 px-6 py-2 rounded-lg font-bold transition-colors w-full md:w-auto shadow-sm ${
                    isDirty
                        ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
            >
                {isDirty ? "Guardar Atribuições" : "Sem alterações"}
            </button>

            <Modal show={showUnsavedModal} maxWidth="md" onClose={() => setShowUnsavedModal(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900">Alteracoes por guardar</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Fizeste alteracoes na turma "{turma.nome}" que ainda nao foram guardadas. Se saires agora, vais perder essas atribuicoes.
                    </p>
                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setShowUnsavedModal(false)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={discardChangesAndLeave}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                            Descartar alteracoes
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
