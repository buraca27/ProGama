// resources/js/Pages/Dashboard/Partials/StatsGrid.jsx
import React from "react";

export default function StatsGrid({ userRole, estatisticas, auth, turmas }) {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="p-6 text-gray-900 dark:text-gray-100 text-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden border-2 border-blue-500">
                        {auth.user.foto_perfil ? (
                            <img
                                src={auth.user.foto_perfil}
                                alt="Perfil"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-300">
                                {auth.user.name.charAt(0)}
                            </span>
                        )}
                    </div>
                    <span>
                        Olá, <strong>{auth.user.name}</strong>! Bem-vindo de
                        volta.
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {userRole === "admin" && (
                    <>
                        <DashboardCard
                            title="Total de Utilizadores"
                            value={estatisticas?.total_users || 0}
                            sub="Contas criadas"
                            color="text-blue-600 dark:text-blue-400"
                        />
                        <DashboardCard
                            title="Turmas Ativas"
                            value={estatisticas?.total_turmas || 0}
                            sub="Registadas"
                            color="text-green-600 dark:text-green-400"
                        />
                        <DashboardCard
                            title="Sistema"
                            value="Online"
                            sub="Tudo operacional"
                            color="text-emerald-600 dark:text-emerald-400"
                        />
                    </>
                )}
                {/* Repete a lógica para Professor e Aluno aqui... */}
            </div>
        </div>
    );
}

function DashboardCard({ title, value, sub, color }) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-all duration-200">
            <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {title}
                </h3>
                <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
            </div>
            <div className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                {sub}
            </div>
        </div>
    );
}
