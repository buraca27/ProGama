// resources/js/Pages/Dashboard/Dashboard.jsx

import React, { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";

// =============================================================================
// IMPORTS DAS VISTAS (Components)
// =============================================================================
import StatsGrid from "./Components/UI/StatsGrid";
import UsersView from "./Components/Users/UsersView";
import UserModals from "./Components/Users/UserModals";
import TurmasView from "./Components/Turmas/TurmasView";
import DisciplinasView from "./Components/Disciplinas/DisciplinasView";
import PlaceholderView from "./Components/UI/PlaceholderView";
import ProfileView from "./Components/Profile/ProfileView";
import SettingsView from "./Components/Profile/SettingsView";
import CategoriasView from "./Components/Categorias/CategoriasView";
import TestesView from "./Components/Professores/TestesView";
import TarefasView from "./Components/Professores/TarefasView";
import AvaliacoesView from "./Components/Professores/AvaliacoesView";
import BoletimView from "./Components/Professores/BoletimView";
import DesafiosView from "./Components/Alunos/DesafiosView";
import LeaderboardView from "./Components/Gamificacao/LeaderboardView";
import NotificacoesView from "./Components/Notificacoes/NotificacoesView";
import DesafioModal from "./Components/Alunos/DesafioModal";
import AdminLandingEditor from "../LandingPage/assets/AdminLandingEditor";

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
        initialDesafioModalId = null,
        landingConteudo = null,
    } = props;

    // =============================================================================
    // ESTADOS DE NAVEGAÇÃO E INTERFACE
    // =============================================================================
    const [activeView, setActiveView] = useState(initialView || "dashboard");

    // Sync when Inertia navigates to a different ?view= (e.g. clicking "Centro de Notificações")
    React.useEffect(() => {
        if (initialView && initialView !== activeView) {
            setActiveView(initialView);
        }
    }, [initialView]);
    const [showNovoUserForm, setShowNovoUserForm] = useState(false);
    const [desafioModalId, setDesafioModalId] = useState(initialDesafioModalId);

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

            <div className="">
                {/* 1. VISTA PRINCIPAL */}
                {activeView === "dashboard" && (
                    <StatsGrid
                        userRole={userRoleReal}
                        estatisticas={estatisticas}
                        auth={auth}
                        turmas={turmas}
                        trabalhosPendentes={trabalhosPendentes}
                        tarefasProfessor={tarefasProfessor}
                    />
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
                    />
                )}

                {activeView === "disciplinas" && (
                    <DisciplinasView
                        disciplinas={disciplinas}
                        turmas={turmas}
                        utilizadores={utilizadores}
                        userRole={userRoleReal}
                        auth={auth}
                    />
                )}

                {activeView === "categorias" && (
                    <CategoriasView
                        categorias={categorias}
                        userRole={userRoleReal}
                        auth={auth}
                    />
                )}

                {/* 4. PERFIL E DEFINIÇÕES */}
                {activeView === "perfil" && (
                    <ProfileView
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                )}
                {activeView === "definicoes" && <SettingsView />}

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
                        desafiosAluno={desafiosAluno}
                        inscricoesDesafiosAluno={inscricoesDesafiosAluno}
                        onOpenDesafioModal={(idDesafio) => setDesafioModalId(idDesafio)}
                    />
                )}

                {activeView === "desafios" && (
                    <DesafiosView
                        desafiosAluno={desafiosAluno}
                        inscricoesDesafiosAluno={inscricoesDesafiosAluno}
                        onOpenDesafioModal={(idDesafio) => setDesafioModalId(idDesafio)}
                    />
                )}

                {/* 7. OUTROS PLACEHOLDERS */}
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
        </AuthenticatedLayout>
    );
}
