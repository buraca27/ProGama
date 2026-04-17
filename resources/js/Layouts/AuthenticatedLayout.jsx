import ApplicationLogo from "@/Components/ApplicationLogo";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";

export default function AuthenticatedLayout({
    header,
    children,
    activeView,
    onViewChange,
}) {
    const user = usePage().props.auth.user;
    const userRole = usePage().props.userRoleReal || "admin";

    // Componente reutilizável para os botões do Menu
    const MenuButton = ({ id, label }) => (
        <button
            onClick={() => onViewChange && onViewChange(id)}
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm ${
                activeView === id
                    ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-200">
            {/* --- BARRA LATERAL ESQUERDA --- */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between hidden md:flex shadow-sm z-20 transition-colors duration-200">
                <div>
                    <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-700">
                        <Link href="/">
                            <ApplicationLogo className="block h-8 w-auto fill-current text-blue-600 dark:text-blue-400" />
                        </Link>
                        <span className="ml-3 font-extrabold text-xl text-gray-900 dark:text-gray-100 tracking-tight">
                            ProGama
                        </span>
                    </div>

                    <nav className="mt-6 px-4 space-y-1">
                        <MenuButton
                            id="dashboard"
                            label="Dashboard Principal"
                        />

                        {/* MENUS ESPECÍFICOS PARA ADMIN */}
                        {userRole === "admin" && (
                            <>
                                <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                    Administração
                                </div>
                                <MenuButton
                                    id="utilizadores"
                                    label="Gerir Utilizadores"
                                />
                                <MenuButton
                                    id="turmas"
                                    label="Gestão de Turmas"
                                />
                                <MenuButton
                                    id="definicoes"
                                    label="Definições do Sistema"
                                />
                            </>
                        )}

                        {/* MENUS ESPECÍFICOS PARA PROFESSOR */}
                        {userRole === "professor" && (
                            <>
                                <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                    Área de Ensino
                                </div>
                                <MenuButton
                                    id="minhas-turmas"
                                    label="As Minhas Turmas"
                                />
                                <MenuButton
                                    id="tarefas"
                                    label="Atribuir Tarefas"
                                />
                                <MenuButton
                                    id="avaliacoes"
                                    label="Avaliações e Notas"
                                />
                            </>
                        )}

                        {/* MENUS ESPECÍFICOS PARA ALUNO */}
                        {userRole === "aluno" && (
                            <>
                                <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                    Área do Aluno
                                </div>
                                <MenuButton
                                    id="disciplinas"
                                    label="As Minhas Disciplinas"
                                />
                                <MenuButton
                                    id="trabalhos"
                                    label="Trabalhos Pendentes"
                                />
                                <MenuButton
                                    id="boletim"
                                    label="Boletim de Notas"
                                />
                            </>
                        )}
                    </nav>
                </div>
                
                {/* Perfil e Logout */}
                <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800">
                    <div className="mb-3 px-3">
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {user.name}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mt-1">
                            {userRole === 'admin' ? 'Secretaria' : userRole}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <button
                            onClick={() => onViewChange && onViewChange("perfil")}
                            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeView === "perfil"
                                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700"
                            }`}
                        >
                            Meu Perfil
                        </button>

                        <ResponsiveNavLink
                            method="post"
                            href={route("logout")}
                            as="button"
                            className="rounded-lg text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 focus:bg-red-50 dark:focus:bg-red-900/30 w-full text-left"
                        >
                            Terminar Sessão
                        </ResponsiveNavLink>
                    </div>
                </div>
            </aside>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {header && (
                    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 z-10 transition-colors duration-200">
                        <div className="px-8 py-5">{header}</div>
                    </header>
                )}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-200">
                    {children}
                </main>
            </div>
        </div>
    );
}