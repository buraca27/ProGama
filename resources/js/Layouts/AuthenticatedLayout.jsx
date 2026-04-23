import ApplicationLogo from "@/Components/ApplicationLogo";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import UpdatePasswordForm from "@/Pages/Dashboard/Components/Profile/UpdatePasswordForm";
import Toast from "@/Components/Toast";

export default function AuthenticatedLayout({
    user,
    header,
    children,
    activeView,
    onViewChange,
}) {
    const { auth, flash } = usePage().props;

    // Verifica se o utilizador tem de mudar a password
    const mustChangePassword = auth.user.must_change_password;

    // Evita o conflito de declaração com a prop 'user'
    const currentUser = auth.user;
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
            {/* --- 1. BARRA LATERAL ESQUERDA (ASIDE) --- */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between hidden md:flex z-20 transition-colors duration-200">
                <div>
                    {/* Cabeçalho do Logo: Altura h-16 fixa para alinhar com o Header */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                        <Link href="/" className="flex items-center">
                            <ApplicationLogo className="block h-8 w-auto fill-current text-blue-600 dark:text-blue-400" />
                            <span className="ml-3 font-extrabold text-xl text-gray-900 dark:text-gray-100 tracking-tight">
                                ProGama
                            </span>
                        </Link>
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
                                <MenuButton
                                    id="disciplinas"
                                    label="Gestão de Disciplinas"
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

                {/* Perfil e Logout (Fundo da Sidebar) */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800">
                    <div className="mb-3 px-3">
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                            {currentUser.name}
                        </div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase mt-1">
                            {userRole === "admin" ? "Secretaria" : userRole}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <button
                            onClick={() =>
                                onViewChange && onViewChange("perfil")
                            }
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
                            className="rounded-lg text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 w-full text-left py-2 px-4 text-sm font-medium"
                        >
                            Terminar Sessão
                        </ResponsiveNavLink>
                    </div>
                </div>
            </aside>

            {/* --- 2. ÁREA DE CONTEÚDO (DIREITA) --- */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header: h-16 e border-b para encaixe perfeito com a Sidebar */}
                {header && (
                    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center z-10 transition-colors duration-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                            <div className="flex items-center">{header}</div>
                        </div>
                    </header>
                )}

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* --- 3. MODAL DE ALTERAÇÃO DE PASSWORD OBRIGATÓRIA --- */}
            <Modal show={mustChangePassword} closeable={false}>
                <div className="p-6 bg-white dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Bem-vindo(a) ao ProGama! 🚀
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Como este é o teu primeiro acesso, precisas de definir
                        uma nova palavra-passe de segurança para continuares.
                    </p>

                    <UpdatePasswordForm className="max-w-full" />
                </div>
            </Modal>
            <Toast flash={flash} />
        </div>
    );
}
