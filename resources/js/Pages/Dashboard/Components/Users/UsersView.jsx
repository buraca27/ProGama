import React from "react";
import CreateUserForm from "./CreateUserForm";
import UserTable from "./UserTable";

export default function UsersView({
    utilizadores,
    showNovoUserForm,
    setShowNovoUserForm,
    setUserToView,
    setUserToEdit,
    setUserToDelete,
    setDeleteUserStep,
}) {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Gestão de Utilizadores
                    </h3>
                    <button
                        onClick={() => setShowNovoUserForm(!showNovoUserForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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
    );
}
