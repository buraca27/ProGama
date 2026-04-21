// resources/js/Pages/Dashboard/Dashboard.jsx

import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";

// =============================================================================
// IMPORTS DAS VISTAS (PARTIALS)
// =============================================================================
import StatsGrid from "./Partials/StatsGrid";
import UsersView from "./Partials/UsersView";
import UserModals from "./Partials/UserModals";
import TurmasView from "./Partials/TurmasView";
import PlaceholderView from "./Partials/PlaceholderView";
import ProfileView from "./Partials/ProfileView";
import SettingsView from "./Partials/SettingsView";

export default function Dashboard(props) {
    // --- Desestruturação das Props (Dados vindos do Laravel) ---
    const {
        auth,
        userRoleReal,
        estatisticas,
        utilizadores,
        turmas,
        status,
        mustVerifyEmail,
    } = props;

    // =============================================================================
    // ESTADOS DE NAVEGAÇÃO E INTERFACE
    // =============================================================================
    const [activeView, setActiveView] = useState("dashboard");
    const [showNovoUserForm, setShowNovoUserForm] = useState(false);

    // =============================================================================
    // ESTADOS DOS MODAIS (GESTÃO DE UTILIZADORES)
    // =============================================================================
    const [userToView, setUserToView] = useState(null);
    const [userToEdit, setUserToEdit] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleteUserStep, setDeleteUserStep] = useState(0);

    // =============================================================================
    // FUNÇÕES DE AÇÃO (ROUTING / API)
    // =============================================================================
    const submitEditUser = (e) => {
        e.preventDefault();
        router.put(`/dashboard/utilizadores/${userToEdit.id}`, userToEdit, {
            onSuccess: () => setUserToEdit(null),
        });
    };

    const confirmDeleteUser = () => {
        router.delete(`/dashboard/utilizadores/${userToDelete.id}`, {
            onSuccess: () => {
                setUserToDelete(null);
                setDeleteUserStep(0);
            },
        });
    };

    return (
        <AuthenticatedLayout
            activeView={activeView}
            onViewChange={setActiveView}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200">
                    ProGama Workspace
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-2">
                {/* ---------------------------------------------------------
                    1. VISTA PRINCIPAL (ESTATÍSTICAS)
                --------------------------------------------------------- */}
                {activeView === "dashboard" && (
                    <StatsGrid
                        userRole={userRoleReal}
                        estatisticas={estatisticas}
                        auth={auth}
                        turmas={turmas}
                    />
                )}

                {/* ---------------------------------------------------------
                    2. GESTÃO DE UTILIZADORES (ADMIN)
                --------------------------------------------------------- */}
                {activeView === "utilizadores" && (
                    <UsersView
                        utilizadores={utilizadores}
                        showNovoUserForm={showNovoUserForm}
                        setShowNovoUserForm={setShowNovoUserForm}
                        setUserToView={setUserToView}
                        setUserToEdit={setUserToEdit}
                        setUserToDelete={setUserToDelete}
                        setDeleteUserStep={setDeleteUserStep}
                    />
                )}

                {/* ---------------------------------------------------------
                    3. VISTAS DE TURMAS E DISCIPLINAS (TODOS OS ROLES)
                --------------------------------------------------------- */}
                {(activeView === "turmas" ||
                    activeView === "minhas-turmas" ||
                    activeView === "disciplinas") && (
                    <TurmasView
                        turmas={turmas}
                        utilizadores={utilizadores}
                        userRole={userRoleReal}
                        auth={auth}
                    />
                )}

                {/* ---------------------------------------------------------
                    4. VISTA DO PERFIL (BREEZE / INERTIA)
                --------------------------------------------------------- */}
                {activeView === "perfil" && (
                    <ProfileView
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                )}

                {/* ---------------------------------------------------------
                    5. DEFINIÇÕES DE SISTEMA
                --------------------------------------------------------- */}
                {activeView === "definicoes" && <SettingsView />}

                {/* ---------------------------------------------------------
                    6. VISTAS EM CONSTRUÇÃO (PLACEHOLDERS)
                --------------------------------------------------------- */}
                {activeView === "tarefas" && (
                    <PlaceholderView title="Atribuir Tarefas" icon="📝" />
                )}
                {activeView === "avaliacoes" && (
                    <PlaceholderView title="Avaliações e Notas" icon="📈" />
                )}
                {activeView === "trabalhos" && (
                    <PlaceholderView title="Trabalhos Pendentes" icon="⌛" />
                )}
                {activeView === "boletim" && (
                    <PlaceholderView title="Boletim de Notas" icon="🎓" />
                )}
            </div>

            {/* =============================================================================
                COMPONENTES GLOBAIS (MODAIS)
            ============================================================================= */}
            <UserModals
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
