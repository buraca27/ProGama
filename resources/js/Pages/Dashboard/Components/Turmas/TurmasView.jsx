// resources/js/Pages/Dashboard/Partials/TurmasView.jsx
import React from "react";
import TurmaAdminEditor from "./TurmaAdminEditor";

export default function TurmasView({ turmas, utilizadores, userRole }) {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {turmas && turmas.length > 0 ? (
                turmas.map((turma) => (
                    <div
                        key={turma.id}
                        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        {/* CABEÇALHO DA TURMA */}
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                                {turma.nome}{" "}
                                <span className="text-base font-normal text-gray-500 ml-2">
                                    ({turma.ano_letivo})
                                </span>
                            </h3>
                            {/* Contador de alunos estilizado */}
                            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800">
                                {turma.alunos?.length || 0} Integrantes
                            </div>
                        </div>

                        {/* ÁREA DE ADMIN: Editor de Atribuições */}
                        {userRole === "admin" && (
                            <div className="mt-4">
                                <TurmaAdminEditor
                                    turma={turma}
                                    utilizadores={utilizadores}
                                />
                            </div>
                        )}

                        {/* ÁREA DE ALUNO/PROFESSOR: Lista de Colegas/Alunos */}
                        {userRole !== "admin" && (
                            <div className="mt-6">
                                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                                    Membros da Turma
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {turma.alunos && turma.alunos.length > 0 ? (
                                        turma.alunos.map((aluno) => (
                                            <div
                                                key={aluno.id}
                                                className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
                                            >
                                                {/* Foto ou Inicial */}
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden shrink-0">
                                                    {aluno.foto_perfil ? (
                                                        <img
                                                            src={
                                                                aluno.foto_perfil
                                                            }
                                                            alt={aluno.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        aluno.name.charAt(0)
                                                    )}
                                                </div>
                                                {/* Nome e Cargo */}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                                                        {aluno.name}
                                                    </p>
                                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-tighter">
                                                        Estudante
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="col-span-full text-center py-6 text-gray-400 italic text-sm">
                                            Ainda não foram atribuídos membros a
                                            esta turma.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        De momento, não estás associado a nenhuma turma.
                    </p>
                </div>
            )}
        </div>
    );
}
