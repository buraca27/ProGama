// resources/js/Pages/Dashboard/Partials/UserModals.jsx
import React, { useState, useEffect, useRef } from "react";
import { usePage } from "@inertiajs/react";
import { compressImageToBase64 } from "@/utils"; // <-- ADICIONA ISTO

export default function UserModals({
    authUser,
    utilizadores, // <-- NOVA PROP RECEBIDA AQUI
    userToView,
    setUserToView,
    userToEdit,
    setUserToEdit,
    userToDelete,
    setUserToDelete,
    deleteUserStep,
    setDeleteUserStep,
    confirmDeleteUser,
    submitEditUser,
}) {
    const { errors } = usePage().props;
    const [isDeleting, setIsDeleting] = useState(false);

    // --- LÓGICA NOVA PARA A FOTO NO EDITAR ---
    const fileEditRef = useRef(null);
    const handleEditFotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            compressImageToBase64(file, (base64String) => {
                setUserToEdit({ ...userToEdit, foto_perfil: base64String });
            });
        }
    };

    useEffect(() => {
        if (!userToDelete) {
            setIsDeleting(false);
        }
    }, [userToDelete]);

    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            setIsDeleting(false);
        }
    }, [errors]);

    if (!userToView && !userToEdit && !userToDelete) return null;

    const handleConfirmDelete = () => {
        setIsDeleting(true);
        confirmDeleteUser();
    };

    // Verifica se o utilizador está a editar a sua própria conta
    const isEditingSelf = authUser?.id === userToEdit?.id;

    // LÓGICA FRONTEND: Verifica se está a tentar apagar o último admin
    const isLastAdminError =
        userToDelete &&
        userToDelete.id_role === 1 &&
        utilizadores?.filter((u) => u.id_role === 1).length <= 1;

    return (
        <>
            {/* MODAL VER UTILIZADOR */}
            {userToView && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Detalhes do Utilizador
                            </h2>
                            <button
                                onClick={() => setUserToView(null)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-lg"
                            >
                                ✖
                            </button>
                        </div>
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden font-bold text-3xl text-gray-600 dark:text-gray-300 mb-3 border-4 border-blue-100 dark:border-blue-900">
                                {userToView.foto_perfil ? (
                                    <img
                                        src={userToView.foto_perfil}
                                        className="w-full h-full object-cover"
                                        alt="img"
                                    />
                                ) : (
                                    userToView.name.charAt(0)
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {userToView.name}
                            </h3>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold mt-1 ${userToView.id_role === 1 ? "bg-red-100 text-red-800" : userToView.id_role === 2 ? "bg-indigo-100 text-indigo-800" : "bg-green-100 text-green-800"}`}
                            >
                                {userToView.id_role === 1
                                    ? "Secretaria"
                                    : userToView.id_role === 2
                                      ? "Professor"
                                      : "Aluno"}
                            </span>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">
                                    Email Inst.:
                                </span>
                                <span className="text-gray-900 dark:text-gray-200 font-bold">
                                    {userToView.email}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">
                                    Email Pessoal:
                                </span>
                                <span className="text-gray-900 dark:text-gray-200 font-bold">
                                    {userToView.email_pessoal || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">
                                    Criado em:
                                </span>
                                <span className="text-gray-900 dark:text-gray-200 font-bold">
                                    {new Date(
                                        userToView.created_at,
                                    ).toLocaleDateString("pt-PT")}
                                </span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={() => setUserToView(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 transition-colors w-full"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL EDITAR UTILIZADOR */}
            {userToEdit && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form
                        onSubmit={submitEditUser}
                        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700"
                    >
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            Editar Utilizador
                        </h2>

                        {/* NOVO: SECÇÃO DE FOTO NO EDITAR */}
                        <div className="flex flex-col items-center mb-6">
                            <div
                                onClick={() => fileEditRef.current.click()}
                                className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer border-4 border-dashed border-gray-300 hover:border-blue-500 transition-colors relative group"
                            >
                                {userToEdit.foto_perfil ? (
                                    <>
                                        <img
                                            src={userToEdit.foto_perfil}
                                            className="w-full h-full object-cover group-hover:opacity-40 transition-opacity"
                                            alt="Preview"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold bg-black/50">
                                            Mudar Foto
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-3xl opacity-50">
                                        📷
                                    </span>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileEditRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleEditFotoUpload}
                            />
                        </div>

                        {errors?.error && (
                            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm font-bold flex items-center gap-2">
                                <span>❌</span> {errors.error}
                            </div>
                        )}

                        <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nome Completo:
                            <input
                                type="text"
                                value={userToEdit.name}
                                onChange={(e) =>
                                    setUserToEdit({
                                        ...userToEdit,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                            />
                        </label>

                        <label className="block mb-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-1.5">
                                Cargo no Sistema:
                                {isEditingSelf && (
                                    <span
                                        title="Campo bloqueado para o próprio utilizador"
                                        className="text-xs"
                                    >
                                        🔒
                                    </span>
                                )}
                            </div>
                            <select
                                value={userToEdit?.id_role || 3}
                                onChange={(e) =>
                                    setUserToEdit({
                                        ...userToEdit,
                                        id_role: parseInt(e.target.value),
                                    })
                                }
                                disabled={isEditingSelf}
                                className={`w-full border-gray-300 rounded mt-1 dark:text-white dark:border-gray-600 ${
                                    isEditingSelf
                                        ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-80"
                                        : "dark:bg-gray-900"
                                }`}
                            >
                                <option value={3}>Aluno</option>
                                <option value={2}>Professor</option>
                                <option value={1}>Secretaria / Admin</option>
                            </select>

                            {isEditingSelf && (
                                <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-1.5 font-semibold flex items-center gap-1">
                                    Nota: Não podes alterar o teu próprio cargo
                                    por motivos de segurança.
                                </p>
                            )}
                        </label>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setUserToEdit(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-colors"
                            >
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL APAGAR UTILIZADOR */}
            {userToDelete && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-lg border border-red-200 dark:border-red-900">
                        {isLastAdminError ? (
                            // BLOQUEIO IMEDIATO NO FRONTEND
                            <>
                                <div className="text-red-500 mb-4 text-4xl text-center">
                                    ❌
                                </div>
                                <h2 className="text-xl font-bold mb-2 text-red-600 dark:text-red-400 text-center">
                                    Ação Bloqueada
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
                                    Não podes apagar{" "}
                                    <strong>{userToDelete.name}</strong> porque
                                    é o <strong>único administrador</strong> do
                                    sistema neste momento. A Secretaria precisa
                                    sempre de pelo menos um membro ativo.
                                </p>
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => setUserToDelete(null)}
                                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-bold transition-colors"
                                    >
                                        Fechar e Voltar
                                    </button>
                                </div>
                            </>
                        ) : (
                            // FLUXO NORMAL DE APAGAR UTILIZADOR
                            <>
                                {errors?.error && (
                                    <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/40 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm font-bold flex items-center gap-2">
                                        <span className="text-lg">❌</span>{" "}
                                        {errors.error}
                                    </div>
                                )}

                                {deleteUserStep === 1 && (
                                    <>
                                        <div className="text-red-500 mb-4 text-4xl">
                                            ⚠️
                                        </div>
                                        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                            Aviso 1: Apagar Utilizador?
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            Estás prestes a apagar{" "}
                                            <strong>{userToDelete.name}</strong>
                                            . Esta ação é permanente na base de
                                            dados.
                                        </p>
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() =>
                                                    setUserToDelete(null)
                                                }
                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setDeleteUserStep(2)
                                                }
                                                className="px-4 py-2 bg-red-600 text-white rounded font-bold transition-colors"
                                            >
                                                Continuar
                                            </button>
                                        </div>
                                    </>
                                )}

                                {deleteUserStep === 2 && (
                                    <>
                                        <div className="text-red-600 mb-4 text-4xl">
                                            🚨
                                        </div>
                                        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                            Aviso 2: cPanel & Email
                                        </h2>
                                        <p className="text-red-600 font-bold mb-4">
                                            A caixa de email será destruída no
                                            cPanel sem hipótese de recuperação.
                                        </p>
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() =>
                                                    setUserToDelete(null)
                                                }
                                                disabled={isDeleting}
                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold transition-colors disabled:opacity-50"
                                            >
                                                Abortar
                                            </button>
                                            <button
                                                onClick={handleConfirmDelete}
                                                disabled={isDeleting}
                                                className={`px-4 py-2 text-white rounded font-bold uppercase shadow-sm transition-all ${
                                                    isDeleting
                                                        ? "bg-red-900 cursor-not-allowed opacity-70"
                                                        : "bg-red-700 hover:bg-red-800 shadow-red-500/20"
                                                }`}
                                            >
                                                {isDeleting ? (
                                                    <span className="flex items-center gap-2">
                                                        <svg
                                                            className="animate-spin h-4 w-4 text-white"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            ></path>
                                                        </svg>
                                                        A processar...
                                                    </span>
                                                ) : (
                                                    "Sim, Apagar Tudo"
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
