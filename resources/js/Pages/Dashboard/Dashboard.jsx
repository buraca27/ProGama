// resources/js/Pages/Dashboard/Dashboard.jsx

import React, { Suspense, lazy, useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";

// =============================================================================
// IMPORTS DAS VISTAS (Components)
// StatsGrid é carregado imediatamente (vista inicial).
// As restantes são lazy-loaded: o bundle de cada vista só é transferido
// quando o utilizador navega para essa secção pela primeira vez.
// =============================================================================
import StatsGrid from "./Components/UI/StatsGrid";

const UsersView         = lazy(() => import("./Components/Users/UsersView"));
const UserModals        = lazy(() => import("./Components/Users/UserModals"));
const TurmasView        = lazy(() => import("./Components/Turmas/TurmasView"));
const DisciplinasView   = lazy(() => import("./Components/Disciplinas/DisciplinasView"));
const PlaceholderView   = lazy(() => import("./Components/UI/PlaceholderView"));
const ProfileView       = lazy(() => import("./Components/Profile/ProfileView"));
const SettingsView      = lazy(() => import("./Components/Profile/SettingsView"));
const CategoriasView    = lazy(() => import("./Components/Categorias/CategoriasView"));
const TestesView        = lazy(() => import("./Components/Professores/TestesView"));
const TarefasView       = lazy(() => import("./Components/Professores/TarefasView"));
const AvaliacoesView    = lazy(() => import("./Components/Professores/AvaliacoesView"));
const BoletimView       = lazy(() => import("./Components/Professores/BoletimView"));
const DesafiosView      = lazy(() => import("./Components/Alunos/DesafiosView"));
const LeaderboardView   = lazy(() => import("./Components/Gamificacao/LeaderboardView"));
const SocialView           = lazy(() => import("./Components/Social/SocialView"));
const PerfilPublicoModal   = lazy(() => import("./Components/Social/PerfilPublicoModal"));
const NotificacoesView  = lazy(() => import("./Components/Notificacoes/NotificacoesView"));
const DesafioModal      = lazy(() => import("./Components/Alunos/DesafioModal"));
const AdminLandingEditor = lazy(() => import("../LandingPage/assets/AdminLandingEditor"));

function ViewSpinner() {
    return (
        <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

export default function Dashboard(props) {
    // --- Desestruturação das Props (Incluindo tarefasAluno) ---
    const {
        auth,
        userRoleReal,
        estatisticas,
        utilizadores = [],
        turmas = [],
        disciplinas = [],
        categorias = [],
        status,
        mustVerifyEmail,
        initialView = "dashboard",
        initialSubmissaoId = null,
        perguntasProfessor = [],
        perguntasBancoProfessor = null,
        perguntasBancoFiltros = null,
        testesProfessor = [],
        tarefasProfessor = [],
        desafiosAluno = [],
        inscricoesDesafiosAluno = [],
        notasAluno = [],
        correcoesProfessor = null,
        trabalhosPendentes = 0,
        badgesProfessor = [],
        podio = [],
        ranking_xp = [],
        ranking_nivel = [],
        ranking_badges = [],
        notificacoesData = null,
        socialData = null,
        perfilPublicoData = null,
        initialDesafioModalId = null,
        landingConteudo = null,
        minhaPosicao = null,
    } = props;

    // =============================================================================
    // ESTADOS DE NAVEGAÇÃO E INTERFACE
    // =============================================================================
    const [activeView, setActiveView] = useState(initialView || "dashboard");

    // Sync only when the server explicitly navigates to a non-default view (e.g. ?view=notificacoes).
    // Ignoring "dashboard" prevents social/profile actions (which redirect back to /dashboard)
    // from resetting the active view the user is currently on.
    React.useEffect(() => {
        if (initialView && initialView !== "dashboard" && initialView !== activeView) {
            setActiveView(initialView);
        }
    }, [initialView]);
    const [showNovoUserForm, setShowNovoUserForm] = useState(false);
    const [desafioModalId, setDesafioModalId] = useState(initialDesafioModalId);
    const [perfilPublicoId, setPerfilPublicoId] = useState(null);

    const openPerfilPublico = (id) => {
        setPerfilPublicoId(id);
        router.reload({
            only: ["perfilPublicoData"],
            data: { perfil_publico_id: id },
            replace: true,
            onSuccess: () => window.history.replaceState(null, "", route("dashboard")),
        });
    };

    const closePerfilPublico = () => setPerfilPublicoId(null);

    const perfilPublicoLoading = perfilPublicoId !== null && perfilPublicoData?.usuario?.id !== perfilPublicoId;

    const desafioModalAtribuicao = useMemo(
        () => (desafioModalId ? (desafiosAluno.find((a) => a.id_desafio === desafioModalId) ?? null) : null),
        [desafioModalId, desafiosAluno],
    );
    const desafioModalInscricao = useMemo(
        () => (desafioModalId ? (inscricoesDesafiosAluno.find((i) => i.id_desafio === desafioModalId) ?? null) : null),
        [desafioModalId, inscricoesDesafiosAluno],
    );

    const handleCloseDesafioModal = () => {
        setDesafioModalId(null);
        const url = new URL(window.location.href);
        if (url.searchParams.has("desafio_modal_id")) {
            url.searchParams.delete("desafio_modal_id");
            window.history.replaceState({}, "", url.toString());
        }
    };

    // =============================================================================
    // ESTADOS DOS MODAIS
    // =============================================================================
    const [userToView, setUserToView] = useState(null);
    const [userToEdit, setUserToEdit] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleteUserStep, setDeleteUserStep] = useState(0);

    // =============================================================================
    // FUNÇÕES DE AÇÃO
    // =============================================================================
    const submitEditUser = (e) => {
        e.preventDefault();
        router.put(`/dashboard/utilizadores/${userToEdit.id}`, userToEdit, {
            onSuccess: () => setUserToEdit(null),
        });
    };

    const confirmDeleteUser = (options = {}) => {
        router.delete(`/dashboard/utilizadores/${userToDelete.id}`, {
            onSuccess: () => {
                setUserToDelete(null);
                setDeleteUserStep(0);
            },
            onFinish: options.onFinish,
        });
    };

    return (
        <AuthenticatedLayout
            activeView={activeView}
            onViewChange={setActiveView}
        >
            <Head title="Dashboard" />

            <Suspense fallback={<ViewSpinner />}>
                <div className="">
                    {/* 1. VISTA PRINCIPAL */}
                    {activeView === "dashboard" && (
                        <div className="space-y-6">
                            <StatsGrid
                                userRole={userRoleReal}
                                estatisticas={estatisticas}
                                auth={auth}
                                turmas={turmas}
                                disciplinas={disciplinas}
                                trabalhosPendentes={trabalhosPendentes}
                                tarefasProfessor={tarefasProfessor}
                                desafiosAluno={desafiosAluno}
                                inscricoesDesafiosAluno={inscricoesDesafiosAluno}
                                notasAluno={notasAluno}
                            />
                            <ProfileView
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                onOpenPerfil={openPerfilPublico}
                                onViewChange={setActiveView}
                                showForms={false}
                            />
                        </div>
                    )}

                    {/* 2. GESTÃO DE UTILIZADORES */}
                    {activeView === "utilizadores" && (
                        <UsersView
                            auth={auth}
                            utilizadores={utilizadores}
                            showNovoUserForm={showNovoUserForm}
                            setShowNovoUserForm={setShowNovoUserForm}
                            setUserToView={setUserToView}
                            setUserToEdit={setUserToEdit}
                            setUserToDelete={setUserToDelete}
                            setDeleteUserStep={setDeleteUserStep}
                        />
                    )}

                    {/* 3. TURMAS, DISCIPLINAS E CATEGORIAS */}
                    {(activeView === "turmas" ||
                        activeView === "minhas-turmas") && (
                        <TurmasView
                            turmas={turmas}
                            utilizadores={utilizadores}
                            userRole={userRoleReal}
                            auth={auth}
                            onOpenPerfil={openPerfilPublico}
                        />
                    )}

                    {activeView === "disciplinas" && (
                        <DisciplinasView
                            disciplinas={disciplinas}
                            turmas={turmas}
                            utilizadores={utilizadores}
                            userRole={userRoleReal}
                            auth={auth}
                            onOpenPerfil={openPerfilPublico}
                        />
                    )}

                    {activeView === "categorias" && (
                        <CategoriasView
                            categorias={categorias}
                            userRole={userRoleReal}
                            auth={auth}
                        />
                    )}

                    {/* 4. DEFINIÇÕES */}
                    {activeView === "definicoes" && (
                        <ProfileView
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            onOpenPerfil={openPerfilPublico}
                            onViewChange={setActiveView}
                            showStats={false}
                            showForms={true}
                        />
                    )}

                    {/* 5. VISTAS PROFESSOR */}
                    {activeView === "testes" && (
                        <TestesView
                            authUserId={auth?.user?.id || null}
                            perguntasProfessor={perguntasProfessor}
                            perguntasBancoProfessor={perguntasBancoProfessor}
                            perguntasBancoFiltros={perguntasBancoFiltros}
                            testesProfessor={testesProfessor}
                            categorias={categorias}
                            badgesProfessor={badgesProfessor}
                        />
                    )}

                    {activeView === "tarefas" && (
                        <TarefasView
                            testesProfessor={testesProfessor}
                            turmas={turmas}
                            tarefasProfessor={tarefasProfessor}
                        />
                    )}

                    {/* 6. VISTA TRABALHOS PENDENTES (ALUNO) */}
                    {activeView === "trabalhos" && (
                        <DesafiosView
                            mode="trabalhos"
                            desafiosAluno={desafiosAluno}
                            inscricoesDesafiosAluno={inscricoesDesafiosAluno}
                            onOpenDesafioModal={setDesafioModalId}
                        />
                    )}

                    {activeView === "desafios" && (
                        <DesafiosView
                            mode="desafios"
                            desafiosAluno={desafiosAluno}
                            inscricoesDesafiosAluno={inscricoesDesafiosAluno}
                        />
                    )}

                    {/* 7. OUTROS */}
                    {activeView === "avaliacoes" && (
                        <AvaliacoesView
                            correcoesProfessor={correcoesProfessor}
                            initialSubmissaoId={initialSubmissaoId}
                        />
                    )}
                    {activeView === "boletim" && (
                        <BoletimView notasAluno={notasAluno} />
                    )}

                    {activeView === "leaderboard" && (
                        <LeaderboardView
                            podio={podio}
                            ranking_xp={ranking_xp}
                            ranking_nivel={ranking_nivel}
                            ranking_badges={ranking_badges}
                            onViewChange={setActiveView}
                            onOpenPerfil={openPerfilPublico}
                            authUserId={auth.user.id}
                            minhaPosicao={minhaPosicao}
                        />
                    )}

                    {activeView === "social" && (
                        <SocialView
                            sugestoes={socialData?.sugestoes ?? []}
                            seguindo={socialData?.seguindo ?? []}
                            seguidores={socialData?.seguidores ?? []}
                            pedidosPendentes={socialData?.pedidos_pendentes ?? []}
                            social_stats={socialData?.social_stats ?? {}}
                            isSearching={socialData?.is_searching ?? false}
                            active_filter={socialData?.active_filter ?? ""}
                            onViewChange={setActiveView}
                            onOpenPerfil={openPerfilPublico}
                            onCloseModal={closePerfilPublico}
                        />
                    )}

                    {activeView === "notificacoes" && (
                        <NotificacoesView notificacoesData={notificacoesData} />
                    )}

                    {activeView === "updateLandingPage" && (
                        <AdminLandingEditor conteudo={landingConteudo} />
                    )}
                </div>

                {/* MODAL DE DESAFIO */}
                {desafioModalId && (
                    <DesafioModal
                        atribuicao={desafioModalAtribuicao}
                        inscricao={desafioModalInscricao}
                        onClose={handleCloseDesafioModal}
                        returnView={activeView}
                    />
                )}

                {/* MODAL: Perfil Público */}
                {perfilPublicoId && (
                    <PerfilPublicoModal
                        dados={perfilPublicoData}
                        loading={perfilPublicoLoading}
                        onClose={closePerfilPublico}
                    />
                )}

                {/* MODAIS GLOBAIS */}
                <UserModals
                    authUser={auth.user}
                    utilizadores={utilizadores}
                    turmas={turmas}
                    userToView={userToView}
                    setUserToView={setUserToView}
                    userToEdit={userToEdit}
                    setUserToEdit={setUserToEdit}
                    userToDelete={userToDelete}
                    setUserToDelete={setUserToDelete}
                    deleteUserStep={deleteUserStep}
                    setDeleteUserStep={setDeleteUserStep}
                    confirmDeleteUser={confirmDeleteUser}
                    submitEditUser={submitEditUser}
                />
            </Suspense>
        </AuthenticatedLayout>
    );
}
