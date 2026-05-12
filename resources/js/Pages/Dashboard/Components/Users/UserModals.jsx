// resources/js/Pages/Dashboard/Components/Users/UserModals.jsx
import React, { useState, useEffect, useRef } from "react";
import { compressImageToBase64 } from "@/utils";
import { usePage, router } from "@inertiajs/react"; // <-- Adiciona o router aqui

export default function UserModals({
    authUser,
    utilizadores,
    turmas,
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

    // --- LÓGICA PARA A FOTO NO EDITAR ---
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

    // --- ADICIONAR ESTA FUNÇÃO NOVA ---
    const handleEditSubmit = (e) => {
        e.preventDefault(); // Impede a página de recarregar
        
        // Envia todos os dados que alteraste para o backend
        router.put(route('utilizadores.update', userToEdit.id), userToEdit, {
            preserveScroll: true,
            onSuccess: () => {
                // Fecha o modal automaticamente se não houver erros
                setUserToEdit(null);
            },
        });
    };
    
    // Verifica se o utilizador está a editar a sua própria conta
    const isEditingSelf = authUser?.id === userToEdit?.id;

    // LÓGICA FRONTEND: Verifica se está a tentar apagar o último admin
    const isLastAdminError =
        userToDelete &&
        userToDelete.id_role === 1 &&
        utilizadores?.filter((u) => u.id_role === 1).length <= 1;

    // Função para calcular a idade
    const calcularIdade = (data) => {
        if (!data) return null;
        const hoje = new Date();
        const nascimento = new Date(data);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const m = hoje.getMonth() - nascimento.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        return idade;
    };

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
                                {userToView.id_role === 1 ? "Secretaria" : userToView.id_role === 2 ? "Professor" : "Aluno"}
                            </span>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Email Inst.:</span>
                                <span className="text-gray-900 dark:text-gray-200 font-bold">{userToView.email}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Email Pessoal:</span>
                                <span className="text-gray-900 dark:text-gray-200 font-bold">{userToView.email_pessoal || "N/A"}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">NIF:</span>
                                <span className="text-gray-900 dark:text-gray-200 font-bold">{userToView.nif || "N/A"}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Nascimento:</span>
                                <span className="text-gray-900 dark:text-gray-200 font-bold">
                                    {userToView.data_nascimento ? (
                                        <>
                                            {new Date(userToView.data_nascimento).toLocaleDateString("pt-PT")}
                                            <span className="text-gray-500 dark:text-gray-400 font-normal text-xs ml-1">
                                                ({calcularIdade(userToView.data_nascimento)} anos)
                                            </span>
                                        </>
                                    ) : "N/A"}
                                </span>
                            </div>

                            {userToView.id_role === 3 && (
                                <>
                                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Processo Interno:</span>
                                        <span className="text-gray-900 dark:text-gray-200 font-bold">{userToView.nmr_processo_interno || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Turma:</span>
                                        <span className="text-gray-900 dark:text-gray-200 font-bold">{userToView.turma?.nome || "Sem Turma"}</span>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Criado em:</span>
                                <span className="text-gray-900 dark:text-gray-200 font-bold">
                                    {new Date(userToView.created_at).toLocaleDateString("pt-PT")}
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
                        onSubmit={handleEditSubmit}
                        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[90vh]"
                    >
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white text-center">
                            Editar Utilizador
                        </h2>

                        {/* FOTO */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative">
                                <div
                                    onClick={() => fileEditRef.current.click()}
                                    className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer border-4 border-dashed border-gray-300 hover:border-blue-500 transition-colors relative group"
                                >
                                    {userToEdit.foto_perfil ? (
                                        <>
                                            <img src={userToEdit.foto_perfil} className="w-full h-full object-cover group-hover:opacity-40" alt="Preview" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white text-xs font-bold bg-black/50">Mudar</div>
                                        </>
                                    ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 dark:text-gray-500 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    )}
                                </div>
                                {userToEdit.foto_perfil && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setUserToEdit({ ...userToEdit, foto_perfil: null });
                                        }}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs border-2 border-white dark:border-gray-800"
                                    >✖</button>
                                )}
                            </div>
                            <input type="file" ref={fileEditRef} className="hidden" accept="image/*" onChange={handleEditFotoUpload} />
                        </div>

                        {errors && Object.keys(errors).length > 0 && (
                            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-400 dark:border-red-800 rounded-lg text-sm">
                                <strong className="flex items-center gap-2 mb-2 font-bold text-base">
                                    <span>❌</span> Não foi possível guardar:
                               </strong>
                                <ul className="list-disc ml-8 space-y-1 font-medium">
                                    {Object.entries(errors).map(([key, err]) => (
                                        <li key={key}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nome Completo:
                                <input
                                    type="text"
                                    value={userToEdit.name || ""}
                                    onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                                    className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                                />
                                {errors?.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                            </label>

                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email Pessoal:
                                <input
                                    type="email"
                                    value={userToEdit.email_pessoal || ""}
                                    onChange={(e) => setUserToEdit({ ...userToEdit, email_pessoal: e.target.value })}
                                    className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                                />
                            </label>

                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                NIF:
                                <input
                                    type="text"
                                    maxLength="9"
                                    value={userToEdit.nif || ""}
                                    onChange={(e) => setUserToEdit({ ...userToEdit, nif: e.target.value })}
                                    className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                                />
                                {errors?.nif && <span className="text-red-500 text-xs">{errors.nif}</span>}
                            </label>

                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Data de Nascimento:
                                <input
                                    type="date"
                                    value={userToEdit.data_nascimento || ""}
                                    onChange={(e) => setUserToEdit({ ...userToEdit, data_nascimento: e.target.value })}
                                    className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                                />
                            </label>

                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                <div className="flex items-center gap-1.5">Cargo: {isEditingSelf && "🔒"}</div>
                                <select
                                    value={userToEdit?.id_role || 3}
                                    onChange={(e) => setUserToEdit({ ...userToEdit, id_role: parseInt(e.target.value) })}
                                    disabled={isEditingSelf}
                                    className={`w-full border-gray-300 rounded mt-1 dark:text-white dark:border-gray-600 ${isEditingSelf ? "bg-gray-100 dark:bg-gray-700" : "dark:bg-gray-900"}`}
                                >
                                    <option value={1}>Secretaria</option>
                                    <option value={2}>Professor</option>
                                    <option value={3}>Aluno</option>
                                </select>
                            </label>

                            {userToEdit?.id_role === 3 && (
                                <>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Processo Interno:
                                        <input
                                            type="text"
                                            value={userToEdit.nmr_processo_interno || ""}
                                            onChange={(e) => setUserToEdit({ ...userToEdit, nmr_processo_interno: e.target.value })}
                                            className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                                        />
                                    </label>
<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-2">
                                    Turma Atual:
                                    <select
                                        value={userToEdit.id_turma || ""}
                                        onChange={(e) => setUserToEdit({ ...userToEdit, id_turma: e.target.value })}
                                        className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                                    >
                                        <option value="">Sem Turma Atribuída</option>
                                        {turmas && turmas.map(t => (
                                            <option key={t.id} value={t.id}>{t.nome}</option>
                                        ))}
                                    </select>
                                </label>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setUserToEdit(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 transition-colors"
                            >Cancelar</button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-colors"
                            >Guardar</button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL APAGAR UTILIZADOR */}
            {userToDelete && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-lg border border-red-200">
                        {isLastAdminError ? (
                            <div className="text-center">
                                <div className="text-red-500 mb-4 text-4xl">❌</div>
                                <h2 className="text-xl font-bold mb-2 text-red-600">Ação Bloqueada</h2>
                                <p className="text-gray-700 dark:text-gray-300 mb-6">Não podes apagar o único administrador do sistema.</p>
                                <button onClick={() => setUserToDelete(null)} className="px-6 py-2 bg-gray-200 rounded font-bold">Fechar</button>
                            </div>
                        ) : (
                            <>
                                {deleteUserStep === 1 ? (
                                    <>
                                        <div className="text-red-500 mb-4 text-4xl">⚠️</div>
                                        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Apagar Utilizador?</h2>
                                        <p className="mb-6 text-gray-600 dark:text-gray-400">Vais apagar permanentemente <strong>{userToDelete.name}</strong>.</p>
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => setUserToDelete(null)} className="px-4 py-2 bg-gray-200 rounded font-bold">Cancelar</button>
                                            <button onClick={() => setDeleteUserStep(2)} className="px-4 py-2 bg-red-600 text-white rounded font-bold">Continuar</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-red-600 mb-4 text-4xl">🚨</div>
                                        <h2 className="text-xl font-bold mb-2">cPanel & Email</h2>
                                        <p className="text-red-600 font-bold mb-4">A caixa de email será destruída sem hipótese de recuperação.</p>
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => setUserToDelete(null)} disabled={isDeleting} className="px-4 py-2 bg-gray-200 rounded font-bold">Abortar</button>
                                            <button onClick={handleConfirmDelete} disabled={isDeleting} className="px-4 py-2 bg-red-700 text-white rounded font-bold uppercase">
                                                {isDeleting ? "A processar..." : "Sim, Apagar Tudo"}
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