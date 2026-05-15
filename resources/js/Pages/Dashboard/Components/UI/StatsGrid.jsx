// resources/js/Pages/Dashboard/Partials/StatsGrid.jsx
import React from "react";

export default function StatsGrid({
    userRole,
    estatisticas,
    auth,
    turmas,
    disciplinas = [],
    trabalhosPendentes = 0,
    tarefasProfessor = [],
    desafiosAluno = [],
    inscricoesDesafiosAluno = [],
    notasAluno = [],
}) {
    return (
        <div className="max-w-7xl mx-auto space-y-6">


            {/* Grelha de Estatísticas Dinâmica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* --- VISTA: ADMIN --- */}
                {userRole === "admin" && (
                    <>
                        <DashboardCard
                            title="Total de Utilizadores"
                            value={estatisticas?.total_users || 0}
                            sub="Contas geridas no ProGama"
                            color="text-blue-600 dark:text-blue-400"
                        />
                        <DashboardCard
                            title="Turmas Ativas"
                            value={estatisticas?.total_turmas || 0}
                            sub="Registadas este ano letivo"
                            color="text-green-600 dark:text-green-400"
                        />
                        <DashboardCard
                            title="Estado do Servidor"
                            value="100%"
                            sub="Tudo operacional"
                            color="text-emerald-600 dark:text-emerald-400"
                        />
                    </>
                )}

                {/* --- VISTA: PROFESSOR --- */}
                {userRole === "professor" && (
                    <>
                        <DashboardCard
                            title="As Minhas Turmas"
                            value={turmas?.length || 0}
                            sub="Turmas sob sua responsabilidade"
                            color="text-indigo-600 dark:text-indigo-400"
                        />
                        <DashboardCard
                            title="Trabalhos para Avaliar"
                            value={trabalhosPendentes}
                            sub="Submissões pendentes"
                            color="text-orange-600 dark:text-orange-400"
                        />
                        <DashboardCard
                            title="Tarefas Atribuídas"
                            value={tarefasProfessor?.length || 0}
                            sub="Testes atribuídos a alunos"
                            color="text-blue-600 dark:text-blue-400"
                        />
                    </>
                )}

                {/* --- VISTA: ALUNO --- */}
                {userRole === "aluno" && (
                    <>
                        <DashboardCard
                            title="Disciplinas"
                            value={disciplinas?.length || 0}
                            sub="Total de disciplinas matriculadas"
                            color="text-purple-600 dark:text-purple-400"
                        />
                        <DashboardCard
                            title="Tarefas Pendentes"
                            value={(() => {
                                // Conta desafios não completados (sem submissão ou em resolução)
                                const totalDesafios = desafiosAluno?.length || 0;
                                const desafiosCompletos = inscricoesDesafiosAluno?.filter(
                                    (submissao) => submissao.estado === "Concluido" || submissao.estado === "Avaliado" || submissao.estado === "Submetido"
                                ).length || 0;
                                return Math.max(0, totalDesafios - desafiosCompletos);
                            })()}
                            sub="Tarefas a aguardar resolução"
                            color="text-red-600 dark:text-red-400"
                        />
                        <DashboardCard
                            title="Média Global"
                            value={(() => {
                                // Calcula a média das notas avaliadas
                                if (!notasAluno || notasAluno.length === 0) return "-";
                                const soma = notasAluno.reduce((acc, nota) => acc + (nota.valor || 0), 0);
                                const media = soma / notasAluno.length;
                                return media.toFixed(1);
                            })()}
                            sub="Com base nos testes avaliados"
                            color="text-yellow-600 dark:text-yellow-400"
                        />
                    </>
                )}
            </div>
        </div>
    );
}

function DashboardCard({ title, value, sub, color }) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-all duration-200">
            <div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {title}
                </h3>
                <p className={`text-4xl font-black mt-2 ${color}`}>{value}</p>
            </div>
            <div className="mt-4 text-sm font-medium text-gray-400 dark:text-gray-500 italic">
                {sub}
            </div>
        </div>
    );
}
