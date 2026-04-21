import React from "react";
import TurmaAdminEditor from "./TurmaAdminEditor";

export default function TurmasView({ turmas, utilizadores, userRole }) {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {turmas.length > 0 ? (
                turmas.map((turma) => (
                    <div
                        key={turma.id}
                        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700"
                    >
                        <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                            {turma.nome}{" "}
                            <span className="text-base font-normal text-gray-500">
                                ({turma.ano_letivo})
                            </span>
                        </h3>

                        {userRole === "admin" && (
                            <TurmaAdminEditor
                                turma={turma}
                                utilizadores={utilizadores}
                            />
                        )}

                        {/* Aqui podes recolocar a lista de alunos/professores para a vista do aluno */}
                    </div>
                ))
            ) : (
                <p className="text-center py-10 text-gray-500">
                    Nenhuma turma encontrada.
                </p>
            )}
        </div>
    );
}
