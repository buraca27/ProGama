import React, { useEffect, useMemo, useRef, useState } from "react";
import { router, useForm } from "@inertiajs/react";

export default function TarefasView({
    testesProfessor = [],
    turmas = [],
    tarefasProfessor = [],
}) {
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [menuAbertoId, setMenuAbertoId] = useState(null);
    const [editingTarefaId, setEditingTarefaId] = useState(null);
    const [editDatas, setEditDatas] = useState({
        data_hora_abertura: "",
        data_hora_fecho: "",
    });
    const menusRef = useRef({});

    const tarefaForm = useForm({
        id_teste: "",
        turma_ids: [],
        data_hora_abertura: "",
        data_hora_fecho: "",
    });

    const testesDisponiveis = useMemo(
        () => testesProfessor || [],
        [testesProfessor],
    );
    const turmasProfessor = useMemo(() => turmas || [], [turmas]);

    useEffect(() => {
        const onClickOutside = (event) => {
            if (!menuAbertoId) return;

            const menuNode = menusRef.current[menuAbertoId];
            if (!menuNode) return;

            if (!menuNode.contains(event.target)) {
                setMenuAbertoId(null);
            }
        };

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                setMenuAbertoId(null);
            }
        };

        document.addEventListener("mousedown", onClickOutside);
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("mousedown", onClickOutside);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [menuAbertoId]);

    const toDatetimeLocal = (value) => {
        if (!value) return "";
        const normalized = String(value).replace(" ", "T");
        return normalized.slice(0, 16);
    };

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
                tarefaForm.setData({
                    id_teste: "",
                    turma_ids: [],
                    data_hora_abertura: "",
                    data_hora_fecho: "",
                });
                setShowTaskForm(false);
            },
        });
    };

    const iniciarEdicaoDatas = (tarefa) => {
        setEditingTarefaId(tarefa.id);
        setMenuAbertoId(null);
        setEditDatas({
            data_hora_abertura: toDatetimeLocal(tarefa.data_hora_abertura),
            data_hora_fecho: toDatetimeLocal(tarefa.data_hora_fecho),
        });
    };

    const cancelarEdicaoDatas = () => {
        setEditingTarefaId(null);
        setEditDatas({
            data_hora_abertura: "",
            data_hora_fecho: "",
        });
    };

    const guardarEdicaoDatas = (idTarefa) => {
        router.put(
            route("professor.tarefas.update", idTarefa),
            {
                data_hora_abertura: editDatas.data_hora_abertura,
                data_hora_fecho: editDatas.data_hora_fecho,
            },
            {
                preserveScroll: true,
                onSuccess: () => cancelarEdicaoDatas(),
            },
        );
    };

    const terminarTarefa = (idTarefa) => {
        router.post(
            route("professor.tarefas.terminar", idTarefa),
            {},
            { preserveScroll: true },
        );
    };

    const eliminarTarefa = (idTarefa) => {
        if (
            !window.confirm("Tens a certeza que queres eliminar esta tarefa?")
        ) {
            return;
        }

        router.delete(route("professor.tarefas.destroy", idTarefa), {
            preserveScroll: true,
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Abertura da tarefa
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={
                                            tarefaForm.data.data_hora_abertura
                                        }
                                        onChange={(e) =>
                                            tarefaForm.setData(
                                                "data_hora_abertura",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Fecho da tarefa
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={tarefaForm.data.data_hora_fecho}
                                        onChange={(e) =>
                                            tarefaForm.setData(
                                                "data_hora_fecho",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>

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
                            Criar Tarefa
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
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-gray-100">
                                        {tarefa.teste?.titulo || "Teste"}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        Turma: {tarefa.turma?.nome || "-"}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        Janela:{" "}
                                        {tarefa.data_hora_abertura
                                            ? new Date(
                                                  tarefa.data_hora_abertura,
                                              ).toLocaleString()
                                            : "-"}{" "}
                                        ate{" "}
                                        {tarefa.data_hora_fecho
                                            ? new Date(
                                                  tarefa.data_hora_fecho,
                                              ).toLocaleString()
                                            : "-"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Criada em:{" "}
                                        {new Date(
                                            tarefa.created_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <div
                                    className="relative"
                                    ref={(el) => {
                                        if (el) {
                                            menusRef.current[tarefa.id] = el;
                                        } else {
                                            delete menusRef.current[tarefa.id];
                                        }
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMenuAbertoId((current) =>
                                                current === tarefa.id
                                                    ? null
                                                    : tarefa.id,
                                            )
                                        }
                                        className="p-2 rounded-md border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        aria-label="Ações da tarefa"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path d="M10 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 7.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 7.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
                                        </svg>
                                    </button>

                                    {menuAbertoId === tarefa.id && (
                                        <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-20 p-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    iniciarEdicaoDatas(tarefa)
                                                }
                                                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                Editar datas
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMenuAbertoId(null);
                                                    terminarTarefa(tarefa.id);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                Terminar agora
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMenuAbertoId(null);
                                                    eliminarTarefa(tarefa.id);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                Eliminar tarefa
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {editingTarefaId === tarefa.id && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                                            Abertura
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={editDatas.data_hora_abertura}
                                            onChange={(e) =>
                                                setEditDatas((prev) => ({
                                                    ...prev,
                                                    data_hora_abertura:
                                                        e.target.value,
                                                }))
                                            }
                                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                                            Fecho
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={editDatas.data_hora_fecho}
                                            onChange={(e) =>
                                                setEditDatas((prev) => ({
                                                    ...prev,
                                                    data_hora_fecho:
                                                        e.target.value,
                                                }))
                                            }
                                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                guardarEdicaoDatas(tarefa.id)
                                            }
                                            className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                                        >
                                            Guardar datas
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelarEdicaoDatas}
                                            className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
