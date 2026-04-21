// resources/js/Pages/Dashboard/Dashboard.jsx

import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";

// --- Partials do Perfil (Breeze) ---
import UpdateProfileInformationForm from "@/Pages/Profile/Partials/UpdateProfileInformationForm";
import UpdatePasswordForm from "@/Pages/Profile/Partials/UpdatePasswordForm";
import DeleteUserForm from "@/Pages/Profile/Partials/DeleteUserForm";
import UpdateThemeForm from "@/Pages/Profile/Partials/UpdateThemeForm";

// --- Partials do Dashboard (Os teus novos componentes) ---
import StatsGrid from "./Partials/StatsGrid";
import CreateUserForm from "./Partials/CreateUserForm";
import UserTable from "./Partials/UserTable";
import UserModals from "./Partials/UserModals";
import TurmasView from "./Partials/TurmasView";
import PlaceholderView from "./Partials/PlaceholderView";

export default function Dashboard(props) {
    const { auth, userRoleReal, estatisticas, utilizadores, turmas } = props;
    const [activeView, setActiveView] = useState("dashboard");
    const [showNovoUserForm, setShowNovoUserForm] = useState(false);

    // Estados dos Modais
    const [userToView, setUserToView] = useState(null);
    const [userToEdit, setUserToEdit] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleteUserStep, setDeleteUserStep] = useState(0);

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
                {/* 1. VISTA PRINCIPAL */}
                {activeView === "dashboard" && (
                    <StatsGrid
                        userRole={userRoleReal}
                        estatisticas={estatisticas}
                        auth={auth}
                        turmas={turmas}
                    />
                )}

                {/* 2. GESTÃO DE UTILIZADORES */}
                {activeView === "utilizadores" && (
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Gestão de Utilizadores
                                </h3>
                                <button
                                    onClick={() =>
                                        setShowNovoUserForm(!showNovoUserForm)
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                                >
                                    {showNovoUserForm ? "Fechar" : "+ Novo"}
                                </button>
                            </div>
                            {showNovoUserForm && (
                                <CreateUserForm
                                    onSuccess={() => setShowNovoUserForm(false)}
                                />
                            )}
                            <UserTable
                                utilizadores={utilizadores}
                                onView={setUserToView}
                                onEdit={setUserToEdit}
                                onDelete={(u) => {
                                    setUserToDelete(u);
                                    setDeleteUserStep(1);
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* 3. VISTAS DE TURMAS E DISCIPLINAS */}
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

                {/* 4. VISTA DO PERFIL */}
                {activeView === "perfil" && (
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-xl border border-gray-100 dark:border-gray-700">
                            <UpdateThemeForm className="max-w-xl" />
                        </div>
                        <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-xl border border-gray-100 dark:border-gray-700">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={props.mustVerifyEmail}
                                status={props.status}
                                className="max-w-xl"
                            />
                        </div>
                        <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-xl border border-gray-100 dark:border-gray-700">
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>
                        <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-xl border border-gray-100 dark:border-gray-700">
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </div>
                )}

                {/* 5. DEFINIÇÕES DE SISTEMA */}
                {activeView === "definicoes" && (
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Definições do Sistema
                            </h3>
                            <PlaceholderView
                                title="Configurações Avançadas"
                                icon="⚙️"
                            />
                        </div>
                    </div>
                )}

                {/* 6. VISTAS EM CONSTRUÇÃO (PROFESSOR & ALUNO) */}
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
