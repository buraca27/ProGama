import ApplicationLogo from "@/Components/ApplicationLogo";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, router, usePage } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import UpdatePasswordForm from "@/Pages/Dashboard/Components/Profile/UpdatePasswordForm";
import Toast from "@/Components/Toast";
import { useEffect, useMemo, useState } from "react";

export default function AuthenticatedLayout({
    user,
    header,
    children,
    activeView,
    onViewChange,
}) {
    const { auth, flash, notifications } = usePage().props;

    // Verifica se o utilizador tem de mudar a password
    const mustChangePassword = auth.user.must_change_password;

    // Evita o conflito de declaração com a prop 'user'
    const currentUser = auth.user;
    const userRole = usePage().props.userRoleReal || "admin";
    const [dirtyEditors, setDirtyEditors] = useState({});
    const [pendingView, setPendingView] = useState(null);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const unreadCount = notifications?.unread_count || 0;
    const notificationItems = notifications?.items || [];

    const dirtyLabels = useMemo(
        () => Object.values(dirtyEditors).filter(Boolean),
        [dirtyEditors],
    );
    const dirtyDisciplinas = useMemo(
        () =>
            dirtyLabels
                .filter((label) => label.startsWith("disciplina "))
                .map((label) => label.replace(/^disciplina\s+/, "")),
        [dirtyLabels],
    );
    const dirtyTurmas = useMemo(
        () =>
            dirtyLabels
                .filter((label) => label.startsWith("turma "))
                .map((label) => label.replace(/^turma\s+/, "")),
        [dirtyLabels],
    );
    const dirtyOutros = useMemo(
        () =>
            dirtyLabels.filter(
                (label) =>
                    !label.startsWith("disciplina ") && !label.startsWith("turma "),
            ),
        [dirtyLabels],
    );
    const hasUnsavedChanges = dirtyLabels.length > 0;

    useEffect(() => {
        const handleDirtyEditor = (event) => {
            const { editorKey, isDirty, label } = event.detail;

            setDirtyEditors((current) => {
                if (!isDirty) {
                    const next = { ...current };
                    delete next[editorKey];
                    return next;
                }

                return {
                    ...current,
                    [editorKey]: label,
                };
            });
        };

        window.addEventListener("dashboard:editor-dirty", handleDirtyEditor);

        return () => {
            window.removeEventListener("dashboard:editor-dirty", handleDirtyEditor);
        };
    }, []);

    const handleViewChange = (nextView) => {
        if (!onViewChange || nextView === activeView) {
            return;
        }

        if (!hasUnsavedChanges) {
            onViewChange(nextView);
            return;
        }

        setPendingView(nextView);
        setShowUnsavedModal(true);
    };

    const discardChangesAndChangeView = () => {
        if (!pendingView || !onViewChange) {
            setShowUnsavedModal(false);
            return;
        }

        setShowUnsavedModal(false);
        onViewChange(pendingView);
        setPendingView(null);
    };

    // Componente reutilizável para os botões do Menu
    const MenuButton = ({ id, label }) => (
        <button
            onClick={() => handleViewChange(id)}
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm ${
                activeView === id
                    ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
        >
            {label}
        </button>
    );

    const MenuLink = ({ href, label }) => (
        <Link
            href={href}
            className="flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
            {label}
        </Link>
    );

    const markNotificationRead = (id) => {
        router.post(route("notificacoes.ler", id), {}, { preserveScroll: true, preserveState: true });
    };

    const markAllNotificationsRead = () => {
        router.post(route("notificacoes.ler-todas"), {}, { preserveScroll: true, preserveState: true });
    };

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
                                    id="disciplinas"
                                    label="Gestão de Disciplinas"
                                />
                                <MenuButton
                                    id="categorias"
                                    label="Gestão de Categorias"
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
                                    id="testes"
                                    label="Desafios"
                                />
                                <MenuButton
                                    id="tarefas"
                                    label="Atribuir Desafios"
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
                                    id="desafios"
                                    label="Desafios"
                                />
                                <MenuButton
                                    id="boletim"
                                    label="Boletim de Notas"
                                />
                            </>
                        )}

                        <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            Gamificacao
                        </div>
                        <MenuLink href={route("dashboard")} label="Leaderboard" />
                        <MenuLink href={route("social.hub")} label="Rede Social" />
                    </nav>
                </div>

                {/* Perfil e Logout (Fundo da Sidebar) */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800">
                    <div className="mb-3 px-3 relative">
                        <button
                            type="button"
                            onClick={() => setShowNotifications((s) => !s)}
                            className="w-full flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <span className="flex items-center gap-2">
                                <span>🔔</span>
                                <span>Notificacoes</span>
                            </span>
                            <span className={`min-w-5 h-5 px-1 rounded-full text-xs font-bold ${unreadCount > 0 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"}`}>
                                {unreadCount}
                            </span>
                        </button>

                        {showNotifications && (
                            <div className="absolute bottom-12 left-0 right-0 z-50 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                                <div className="max-h-72 overflow-y-auto space-y-1">
                                    {notificationItems.length === 0 && (
                                        <p className="px-2 py-2 text-xs text-gray-500">Sem notificacoes.</p>
                                    )}

                                    {notificationItems.map((item) => (
                                        <button
                                            type="button"
                                            key={item.id}
                                            onClick={() => markNotificationRead(item.id)}
                                            className={`w-full rounded-lg px-2 py-2 text-left text-xs ${item.lida ? "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" : "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"}`}
                                        >
                                            <p className="font-semibold">{item.tipo_notificacao}</p>
                                            <p className="mt-0.5 line-clamp-2">{item.mensagem}</p>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-2 flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={markAllNotificationsRead}
                                        className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold dark:border-gray-700"
                                    >
                                        Ler todas
                                    </button>
                                    <Link
                                        href={route("notificacoes.index")}
                                        className="rounded-md bg-gray-900 px-2 py-1 text-xs font-semibold text-white dark:bg-gray-100 dark:text-gray-900"
                                    >
                                        Centro
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

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
                            onClick={() => handleViewChange("perfil")}
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

            <Modal show={showUnsavedModal} maxWidth="md" onClose={() => setShowUnsavedModal(false)}>
                <div className="p-6 bg-white dark:bg-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Alteracoes por guardar
                    </h2>
                    {dirtyDisciplinas.length > 0 && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Tens alteracoes nas seguintes disciplinas:
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                                {dirtyDisciplinas.map((nome, index) => (
                                    <li key={`disciplina-${nome}-${index}`}>{nome}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {dirtyTurmas.length > 0 && (
                        <div className="mt-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Tens alteracoes nas seguintes turmas:
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                                {dirtyTurmas.map((nome, index) => (
                                    <li key={`turma-${nome}-${index}`}>{nome}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {dirtyOutros.length > 0 && (
                        <div className="mt-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Outros itens com alteracoes:
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                                {dirtyOutros.map((label, index) => (
                                    <li key={`outro-${label}-${index}`}>{label}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setShowUnsavedModal(false);
                                setPendingView(null);
                            }}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={discardChangesAndChangeView}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                            Descartar alteracoes
                        </button>
                    </div>
                </div>
            </Modal>
            <Toast flash={flash} />
        </div>
    );
}
