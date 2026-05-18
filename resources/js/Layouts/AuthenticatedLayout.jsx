import ApplicationLogo from "@/Components/ApplicationLogo";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, router, usePage } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import UpdatePasswordForm from "@/Pages/Dashboard/Components/Profile/UpdatePasswordForm";
import Toast from "@/Components/Toast";
import { useEffect, useMemo, useState } from "react";

const TIPO_LABEL = {
    Novo_Desafio: "Novo Desafio",
    Desafio_Corrigido: "Desafio Corrigido",
    Teste_Corrigido: "Avaliação Corrigida",
    Prazo_Proximo: "Prazo Próximo",
    XP_Recebido: "XP Recebido",
    Novo_Nivel: "Novo Nível",
    Badge_Ganho: "Badge Ganha",
    Submissao_Aluno: "Submissão de Aluno",
    Alerta_Integridade: "Alerta de Integridade",
    Alteracao_Datas: "Datas Alteradas",
};

export default function AuthenticatedLayout({
    header,
    children,
    activeView,
    onViewChange,
}) {
    const { auth, flash, notifications } = usePage().props;

    const mustChangePassword = auth.user.must_change_password;
    const currentUser = auth.user;
    const userRole = usePage().props.userRoleReal || "admin";

    const [dirtyEditors, setDirtyEditors] = useState({});
    const [pendingView, setPendingView] = useState(null);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showMobileNotifications, setShowMobileNotifications] =
        useState(false);

    const unreadCount = notifications?.unread_count || 0;
    const notificationItems = notifications?.items || [];

    const dirtyLabels = useMemo(
        () => Object.values(dirtyEditors).filter(Boolean),
        [dirtyEditors],
    );
    const dirtyDisciplinas = useMemo(
        () =>
            dirtyLabels
                .filter((l) => l.startsWith("disciplina "))
                .map((l) => l.replace(/^disciplina\s+/, "")),
        [dirtyLabels],
    );
    const dirtyTurmas = useMemo(
        () =>
            dirtyLabels
                .filter((l) => l.startsWith("turma "))
                .map((l) => l.replace(/^turma\s+/, "")),
        [dirtyLabels],
    );
    const dirtyOutros = useMemo(
        () =>
            dirtyLabels.filter(
                (l) => !l.startsWith("disciplina ") && !l.startsWith("turma "),
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
                return { ...current, [editorKey]: label };
            });
        };
        window.addEventListener("dashboard:editor-dirty", handleDirtyEditor);
        return () =>
            window.removeEventListener(
                "dashboard:editor-dirty",
                handleDirtyEditor,
            );
    }, []);

    /* Polling de notificações apenas quando o tab está visível.
       Quando o utilizador volta ao tab após estar ausente, actualiza imediatamente. */
    useEffect(() => {
        const doReload = () => router.reload({ only: ["notifications"] });

        const interval = setInterval(() => {
            if (!document.hidden) doReload();
        }, 30000);

        const onVisibilityChange = () => {
            if (!document.hidden) doReload();
        };

        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => {
            clearInterval(interval);
            document.removeEventListener(
                "visibilitychange",
                onVisibilityChange,
            );
        };
    }, []);

    const handleViewChange = (nextView) => {
        setMobileMenuOpen(false);
        if (!onViewChange || nextView === activeView) return;
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

    const markNotificationRead = (
        id,
        tipo = null,
        idDesafio = null,
        idSubmissao = null,
    ) => {
        router.post(
            route("notificacoes.ler", id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setShowNotifications(false);
                    if (tipo === "Submissao_Aluno" && idSubmissao) {
                        router.visit(
                            route("dashboard", {
                                view: "avaliacoes",
                                submissao_id: idSubmissao,
                            }),
                        );
                    } else if (idDesafio) {
                        const params = { desafio_modal_id: idDesafio };
                        if (activeView && activeView !== "dashboard")
                            params.view = activeView;
                        router.visit(route("dashboard", params));
                    }
                },
            },
        );
    };

    const markAllNotificationsRead = () => {
        router.post(
            route("notificacoes.ler-todas"),
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    // ─── Helpers de navegação (render functions, não componentes React) ──────

    const MenuButton = ({ id, label }) => {
        if (!onViewChange) {
            return (
                <Link
                    href={route("dashboard", { view: id })}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    {label}
                </Link>
            );
        }
        return (
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
    };
    const MenuLink = ({ href, label }) => (
        <Link
            href={href}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
            {label}
        </Link>
    );

    // --- ADICIONA ESTE BLOCO AQUI ---
    const ExternalMenuLink = ({ href, label }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
            <span>{label}</span>
            <span className="text-xs opacity-50"></span>
        </a>
    );

    // ─── Conteúdo da barra lateral (partilhado entre desktop e mobile) ────────

    const sidebarNav = (
        <div className="flex flex-col justify-between h-full">
            <div>
                <nav className="mt-6 px-4 space-y-1">
                    <MenuButton id="dashboard" label="Dashboard Principal" />

                    {userRole === "admin" && (
                        <>
                            <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                Administração
                            </div>
                            <MenuButton
                                id="utilizadores"
                                label="Gerir Utilizadores"
                            />
                            <MenuButton id="turmas" label="Gestão de Turmas" />
                            <MenuButton
                                id="disciplinas"
                                label="Gestão de Disciplinas"
                            />
                            <MenuButton
                                id="categorias"
                                label="Gestão de Categorias"
                            />
                            <MenuButton
                                id="updateLandingPage"
                                label="Modificar Landing Page"
                            />
                        </>
                    )}

                    {userRole === "professor" && (
                        <>
                            <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                Área de Ensino
                            </div>
                            <MenuButton
                                id="minhas-turmas"
                                label="As Minhas Turmas"
                            />
                            <MenuButton id="testes" label="Desafios" />
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
                            <MenuButton id="desafios" label="Desafios" />
                            <MenuButton id="boletim" label="Boletim de Notas" />
                        </>
                    )}

                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Gamificacao
                    </div>
                    {onViewChange ? (
                        <MenuButton id="leaderboard" label="Leaderboard" />
                    ) : (
                        <MenuLink
                            href={route("dashboard", { view: "leaderboard" })}
                            label="Leaderboard"
                        />
                    )}
                    {onViewChange ? (
                        <MenuButton id="social" label="Rede Social" />
                    ) : (
                        <MenuLink
                            href={route("social.hub")}
                            label="Rede Social"
                        />
                    )}
                    {/* --- NOVA SECÇÃO DE FERRAMENTAS --- */}
                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Ferramentas
                    </div>
                    <ExternalMenuLink
                        href="https://www.progama.pt:2096/"
                        label="Webmail Institucional"
                    />
                </nav>
            </div>

            {/* Fundo: Notificações + Perfil + Logout */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800">
                <div className="mb-3 px-3 relative">
                    <button
                        type="button"
                        onClick={() => setShowNotifications((s) => !s)}
                        className="w-full flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <span className="flex items-center gap-2">
                            <span>🔔</span>
                            <span>Notificações</span>
                        </span>
                        <span
                            className={`min-w-5 h-5 px-1 rounded-full text-xs font-bold flex items-center justify-center ${unreadCount > 0 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"}`}
                        >
                            {unreadCount}
                        </span>
                    </button>

                    {showNotifications && (
                        <div className="absolute bottom-12 left-0 right-0 z-50 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-600 dark:bg-gray-900 dark:shadow-black/50">
                            <div className="max-h-72 overflow-y-auto scrollbar-hide space-y-1">
                                {notificationItems.length === 0 && (
                                    <p className="px-2 py-2 text-xs text-gray-500 dark:text-gray-400">
                                        Sem notificações.
                                    </p>
                                )}
                                {notificationItems.map((item) => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        onClick={() =>
                                            markNotificationRead(
                                                item.id,
                                                item.tipo_notificacao,
                                                item.id_desafio_relacionado ??
                                                    null,
                                                item.id_submissao_relacionada ??
                                                    null,
                                            )
                                        }
                                        className={`w-full rounded-lg px-2 py-2 text-left text-xs transition-colors ${item.lida ? "text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" : "bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"} ${item.id_desafio_relacionado ? "cursor-pointer" : ""}`}
                                    >
                                        <p className="font-semibold">
                                            {TIPO_LABEL[
                                                item.tipo_notificacao
                                            ] ?? item.tipo_notificacao}
                                        </p>
                                        <p className="mt-0.5 line-clamp-2">
                                            {item.mensagem}
                                        </p>
                                        {item.id_desafio_relacionado && (
                                            <p className="mt-1 text-[10px] opacity-60">
                                                {item.tipo_notificacao ===
                                                "Submissao_Aluno"
                                                    ? "Clica para corrigir a submissão →"
                                                    : "Clica para iniciar o desafio →"}
                                            </p>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    onClick={markAllNotificationsRead}
                                    className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                                >
                                    Ler todas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNotifications(false);
                                        setMobileMenuOpen(false);
                                        if (onViewChange) {
                                            onViewChange("notificacoes");
                                        } else {
                                            router.visit(
                                                route("dashboard", {
                                                    view: "notificacoes",
                                                }),
                                            );
                                        }
                                    }}
                                    className="rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition"
                                >
                                    Ver todas
                                </button>
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
                        onClick={() => handleViewChange("definicoes")}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeView === "definicoes"
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700"
                        }`}
                    >
                        Definições
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
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-200">
            {/* ── MOBILE: Backdrop ─────────────────────────────────────────── */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* ── MOBILE: Drawer ───────────────────────────────────────────── */}
            <div
                className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 md:hidden ${
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Cabeçalho do drawer mobile */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
                    <Link
                        href="/"
                        className="flex items-center"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <ApplicationLogo className="block h-7 w-auto fill-current text-blue-600 dark:text-blue-400" />
                        <span className="ml-2 font-extrabold text-lg text-gray-900 dark:text-gray-100 tracking-tight">
                            ProGama
                        </span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Fechar menu"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">{sidebarNav}</div>
            </div>

            {/* ── DESKTOP: Sidebar fixa ────────────────────────────────────── */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col z-20 transition-colors duration-200">
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
                    <Link href="/" className="flex items-center">
                        <ApplicationLogo className="block h-8 w-auto fill-current text-blue-600 dark:text-blue-400" />
                        <span className="ml-3 font-extrabold text-xl text-gray-900 dark:text-gray-100 tracking-tight">
                            ProGama
                        </span>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto">{sidebarNav}</div>
            </aside>

            {/* ── ÁREA DE CONTEÚDO ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Barra superior mobile */}
                <div className="md:hidden relative flex items-center justify-between h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 shrink-0 z-20">
                    <Link href="/" className="flex items-center">
                        <ApplicationLogo className="h-7 w-auto fill-current text-blue-600 dark:text-blue-400" />
                        <span className="ml-2 font-extrabold text-lg text-gray-900 dark:text-gray-100 tracking-tight">
                            ProGama
                        </span>
                    </Link>
                    <div className="flex items-center gap-1">
                        {/* Sino — abre dropdown inline, sem abrir o drawer */}
                        <button
                            type="button"
                            onClick={() => {
                                setShowMobileNotifications((s) => !s);
                                setMobileMenuOpen(false);
                            }}
                            className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Notificações"
                        >
                            🔔
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>
                        {/* Hamburger — abre drawer de navegação */}
                        <button
                            type="button"
                            onClick={() => {
                                setMobileMenuOpen(true);
                                setShowMobileNotifications(false);
                            }}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Abrir menu"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Dropdown de notificações mobile */}
                    {showMobileNotifications && (
                        <>
                            {/* Backdrop para fechar ao clicar fora */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() =>
                                    setShowMobileNotifications(false)
                                }
                            />
                            <div className="absolute top-full right-2 mt-1 w-80 max-w-[calc(100vw-1rem)] z-20 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-900">
                                <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                        Notificações
                                    </span>
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                                            {unreadCount} novas
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto scrollbar-hide p-2 space-y-1">
                                    {notificationItems.length === 0 && (
                                        <p className="px-2 py-3 text-xs text-center text-gray-500 dark:text-gray-400">
                                            Sem notificações.
                                        </p>
                                    )}
                                    {notificationItems.map((item) => (
                                        <button
                                            type="button"
                                            key={item.id}
                                            onClick={() => {
                                                setShowMobileNotifications(
                                                    false,
                                                );
                                                markNotificationRead(
                                                    item.id,
                                                    item.tipo_notificacao,
                                                    item.id_desafio_relacionado ??
                                                        null,
                                                    item.id_submissao_relacionada ??
                                                        null,
                                                );
                                            }}
                                            className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                                                item.lida
                                                    ? "text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                                    : "bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                                            }`}
                                        >
                                            <p className="font-semibold">
                                                {TIPO_LABEL[
                                                    item.tipo_notificacao
                                                ] ?? item.tipo_notificacao}
                                            </p>
                                            <p className="mt-0.5 line-clamp-2">
                                                {item.mensagem}
                                            </p>
                                            {item.id_desafio_relacionado && (
                                                <p className="mt-1 text-[10px] opacity-60">
                                                    {item.tipo_notificacao ===
                                                    "Submissao_Aluno"
                                                        ? "Toca para corrigir a submissão →"
                                                        : "Toca para iniciar o desafio →"}
                                                </p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            markAllNotificationsRead();
                                        }}
                                        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                                    >
                                        Ler todas
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowMobileNotifications(false);
                                            if (onViewChange) {
                                                onViewChange("notificacoes");
                                            } else {
                                                router.visit(
                                                    route("dashboard", {
                                                        view: "notificacoes",
                                                    }),
                                                );
                                            }
                                        }}
                                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                                    >
                                        Ver todas
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Header de página (desktop) */}
                {header && (
                    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center z-10 transition-colors duration-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                            <div className="flex items-center">{header}</div>
                        </div>
                    </header>
                )}

                {/* Conteúdo principal */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* ── Modal: alterar password obrigatória ──────────────────────── */}
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

            {/* ── Modal: alterações por guardar ────────────────────────────── */}
            <Modal
                show={showUnsavedModal}
                maxWidth="md"
                onClose={() => setShowUnsavedModal(false)}
            >
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
                                    <li key={`disciplina-${nome}-${index}`}>
                                        {nome}
                                    </li>
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
                                    <li key={`turma-${nome}-${index}`}>
                                        {nome}
                                    </li>
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
                                    <li key={`outro-${label}-${index}`}>
                                        {label}
                                    </li>
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
