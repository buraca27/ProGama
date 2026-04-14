import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router } from "@inertiajs/react";
import React, { useState, useRef } from "react";

// Importações do Perfil
import UpdateProfileInformationForm from "@/Pages/Profile/Partials/UpdateProfileInformationForm";
import UpdatePasswordForm from "@/Pages/Profile/Partials/UpdatePasswordForm";
import DeleteUserForm from "@/Pages/Profile/Partials/DeleteUserForm";
import UpdateThemeForm from "@/Pages/Profile/Partials/UpdateThemeForm";

// Importação da função de compressão de imagem
import { compressImageToBase64 } from '@/utils';

// --- SUB-COMPONENTE PARA A SECRETARIA ATRIBUIR USERS ÀS TURMAS ---
function TurmaAdminEditor({ turma, utilizadores }) {
    const todosAlunos = utilizadores.filter((u) => u.id_role === 3);
    const todosProfessores = utilizadores.filter((u) => u.id_role === 2);

    const [selectedAlunos, setSelectedAlunos] = useState(turma.alunos?.map((a) => a.id) || []);
    const [selectedProfs, setSelectedProfs] = useState(turma.professores?.map((p) => p.id) || []);

    const handleSave = () => {
        router.post(`/dashboard/turmas/${turma.id}/assign`, {
            alunos_ids: selectedAlunos,
            professores_ids: selectedProfs,
        }, { preserveScroll: true });
    };

    const toggleSelection = (id, list, setList) => {
        if (list.includes(id)) {
            setList(list.filter((item) => item !== id));
        } else {
            setList([...list, id]);
        }
    };

    return (
        <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg transition-colors border border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold mb-3 text-gray-800 dark:text-gray-200">Docentes Associados</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {todosProfessores.map((p) => (
                            <label key={p.id} className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded cursor-pointer transition-colors">
                                <input type="checkbox" checked={selectedProfs.includes(p.id)} onChange={() => toggleSelection(p.id, selectedProfs, setSelectedProfs)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800" />
                                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center overflow-hidden text-xs font-bold">
                                    {p.foto_perfil ? <img src={p.foto_perfil} className="w-full h-full object-cover" alt="img"/> : p.name.charAt(0)}
                                </div>
                                <span>{p.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg transition-colors border border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold mb-3 text-gray-800 dark:text-gray-200">Alunos Inscritos</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {todosAlunos.map((a) => (
                            <label key={a.id} className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded cursor-pointer transition-colors">
                                <input type="checkbox" checked={selectedAlunos.includes(a.id)} onChange={() => toggleSelection(a.id, selectedAlunos, setSelectedAlunos)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800" />
                                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center overflow-hidden text-xs font-bold">
                                    {a.foto_perfil ? <img src={a.foto_perfil} className="w-full h-full object-cover" alt="img"/> : a.name.charAt(0)}
                                </div>
                                <span>{a.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <button onClick={handleSave} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors w-full md:w-auto shadow-sm">
                Guardar Atribuições
            </button>
        </div>
    );
}

export default function Dashboard({ auth, userRoleReal, estatisticas, utilizadores, turmas }) {
    const userRole = userRoleReal || "admin";
    const [activeView, setActiveView] = useState("dashboard");
    const [showNovoUserForm, setShowNovoUserForm] = useState(false);

    // ==========================================
    // ESTADOS PARA EDIÇÃO, VISUALIZAÇÃO E ELIMINAÇÃO
    // ==========================================
    const [userToView, setUserToView] = useState(null); // <-- Novo estado para ver detalhes
    const [userToEdit, setUserToEdit] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleteUserStep, setDeleteUserStep] = useState(0); 

    const [turmaToEdit, setTurmaToEdit] = useState(null);
    const [turmaToDelete, setTurmaToDelete] = useState(null);

    // Referência para o input de ficheiro (foto) da Secretaria
    const fileInputRefSecretaria = useRef(null);

    // ==========================================
    // LÓGICA DO FORMULÁRIO DE UTILIZADORES
    // ==========================================
    const gerarPassword = () => {
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const nums = "0123456789";
        const syms = "!@#$%";
        const rand = (str) => str[Math.floor(Math.random() * str.length)];
        const base = [rand(upper), rand(upper), rand(lower), rand(lower), rand(nums), rand(nums), rand(nums), rand(syms)];
        return base.sort(() => Math.random() - 0.5).join("") + rand(nums) + rand(upper);
    };

    const { data: userD, setData: setUserD, post: postUser, processing: processingUser, reset: resetUser, transform: transformUser, errors: errorsUser } =
        useForm({
            name: "", numero_interno: "", ano_entrada: new Date().getFullYear().toString(), role: "aluno", password: gerarPassword(), email_pessoal: "", foto_perfil: ""
        });

    const getEmailGerado = () => {
        if (userD.role === "professor" || userD.role === "secretaria") {
            if (!userD.name || userD.name.trim().split(" ").length < 2) return "Aguarda nome completo...";
            const partes = userD.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(" ").filter((p) => p.length > 0);
            return `${partes[0]}.${partes[partes.length - 1]}${userD.role === "professor" ? ".professor" : ""}@progama.pt`;
        }
        if (!userD.numero_interno || !userD.ano_entrada) return "A aguardar dados...";
        return `${userD.numero_interno}${userD.ano_entrada}.alunos@progama.pt`.toLowerCase();
    };

    const handleFotoUpload = (e) => {
        const file = e.target.files[0];
        compressImageToBase64(file, (base64String) => {
            setUserD('foto_perfil', base64String);
        });
    };

    const submitNovoUtilizador = (e) => {
        e.preventDefault();
        transformUser((data) => ({ ...data, email: getEmailGerado() }));
        postUser(route("utilizadores.store"), {
            preserveScroll: true,
            onSuccess: () => { resetUser(); setShowNovoUserForm(false); alert("Conta criada com sucesso!"); },
        });
    };

    const submitEditUser = (e) => {
        e.preventDefault();
        router.put(`/dashboard/utilizadores/${userToEdit.id}`, { name: userToEdit.name, role: userToEdit.id_role }, {
            preserveScroll: true,
            onSuccess: () => setUserToEdit(null),
        });
    };

const confirmDeleteUser = () => {
    router.delete(`/dashboard/utilizadores/${userToDelete.id}`, {
        onSuccess: () => {
            setUserToDelete(null);
            setDeleteUserStep(0);
            router.reload({ preserveScroll: true });
        },
    });
};

    // ==========================================
    // LÓGICA DO FORMULÁRIO DE TURMAS
    // ==========================================
    const { data: turmaD, setData: setTurmaD, post: postTurma, processing: processingTurma, reset: resetTurma } =
        useForm({ nome: "", ano_letivo: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1) });

    const submitNovaTurma = (e) => {
        e.preventDefault();
        postTurma(route("turmas.store"), { preserveScroll: true, onSuccess: () => resetTurma() });
    };

    const submitEditTurma = (e) => {
        e.preventDefault();
        router.put(`/dashboard/turmas/${turmaToEdit.id}`, { nome: turmaToEdit.nome, ano_letivo: turmaToEdit.ano_letivo }, {
            preserveScroll: true,
            onSuccess: () => setTurmaToEdit(null)
        });
    };

    const confirmDeleteTurma = () => {
        router.delete(`/dashboard/turmas/${turmaToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setTurmaToDelete(null)
        });
    };

    const renderContent = () => {
        // ==========================================
        // 1. VISTA PRINCIPAL (HOME)
        // ==========================================
        if (activeView === "dashboard") {
            return (
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="p-6 text-gray-900 dark:text-gray-100 text-lg flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden border-2 border-blue-500">
                                {auth.user.foto_perfil ? (
                                    <img src={auth.user.foto_perfil} alt="Perfil" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-300">{auth.user.name.charAt(0)}</span>
                                )}
                            </div>
                            <span>
                                Olá, <strong>{auth.user.name}</strong>! Bem-vindo de volta ao teu Workspace.
                            </span>
                        </div>
                    </div>

                    {userRole === "admin" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <DashboardCard title="Total de Utilizadores" value={estatisticas?.total_users || 0} sub="Contas criadas" color="text-blue-600 dark:text-blue-400" />
                            <DashboardCard title="Turmas Ativas" value={estatisticas?.total_turmas || 0} sub="Registadas no sistema" color="text-green-600 dark:text-green-400" />
                            <DashboardCard title="Sistema" value="Online" sub="Tudo operacional" color="text-emerald-600 dark:text-emerald-400" />
                        </div>
                    )}

                    {userRole === "professor" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DashboardCard title="As Minhas Turmas" value={turmas?.length || 0} sub="Turmas lecionadas" color="text-indigo-600 dark:text-indigo-400" />
                            <DashboardCard title="Total de Alunos" value={turmas?.reduce((acc, t) => acc + (t.alunos?.length || 0), 0) || 0} sub="Sob a tua orientação" color="text-purple-600 dark:text-purple-400" />
                        </div>
                    )}

                    {userRole === "aluno" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <DashboardCard title="A Minha Turma" value={turmas?.length > 0 ? turmas[0].nome : "N/A"} sub={turmas?.length > 0 ? `Ano: ${turmas[0].ano_letivo}` : "Sem turma"} color="text-blue-600 dark:text-blue-400" />
                            <DashboardCard title="O Meu Nível" value={`Nível ${auth.user.id_nivel || 1}`} sub="Continua a jogar!" color="text-amber-500 dark:text-amber-400" />
                            <DashboardCard title="Experiência" value={`${auth.user.xp_total || 0} XP`} sub="Pontos acumulados" color="text-orange-500 dark:text-orange-400" />
                        </div>
                    )}
                </div>
            );
        }

        // ==========================================
        // 2. VISTA DE TURMAS
        // ==========================================
        if (activeView === "turmas" || activeView === "minhas-turmas" || activeView === "disciplinas") {
            return (
                <div className="max-w-7xl mx-auto space-y-6">
                    {userRole === "admin" && (
                        <form onSubmit={submitNovaTurma} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Turma</label>
                                <input type="text" value={turmaD.nome} onChange={e => setTurmaD("nome", e.target.value)} required placeholder="Ex: TPSI 10" className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ano Letivo</label>
                                <input type="text" value={turmaD.ano_letivo} onChange={e => setTurmaD("ano_letivo", e.target.value)} required placeholder="Ex: 2026/2027" className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <button disabled={processingTurma} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-bold w-full md:w-auto mt-4 md:mt-0 shadow-sm">
                                + Adicionar Turma
                            </button>
                        </form>
                    )}

                    <div className="space-y-6">
                        {turmas && turmas.length > 0 ? turmas.map((turma) => (
                            <div key={turma.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                    <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                                        {turma.nome} <span className="text-base font-normal text-gray-500 ml-2">({turma.ano_letivo})</span>
                                    </h3>
                                    
                                    {/* Botões Admin ou Contagem Alunos */}
                                    {userRole === "admin" ? (
                                        <div className="flex gap-2">
                                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-3 py-1 rounded-full font-bold flex items-center mr-2">
                                                {turma.alunos?.length || 0} Alunos
                                            </span>
                                            <button onClick={() => setTurmaToEdit(turma)} className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1 rounded font-bold text-sm transition-colors">Editar</button>
                                            <button onClick={() => setTurmaToDelete(turma)} className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded font-bold text-sm transition-colors">Apagar</button>
                                        </div>
                                    ) : (
                                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-3 py-1 rounded-full font-bold">
                                            {turma.alunos?.length || 0} Alunos
                                        </span>
                                    )}
                                </div>

                                {userRole === "admin" && <TurmaAdminEditor turma={turma} utilizadores={utilizadores} />}

                                {userRole === "professor" && (
                                    <div className="mt-4">
                                        <h4 className="font-bold mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-2">Alunos Inscritos nesta Turma</h4>
                                        {turma.alunos?.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {turma.alunos.map(a => (
                                                    <div key={a.id} className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-lg shadow-sm">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center overflow-hidden font-bold">
                                                            {a.foto_perfil ? <img src={a.foto_perfil} className="w-full h-full object-cover" alt="img"/> : a.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{a.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{a.email}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">Ainda não existem alunos atribuídos a esta turma.</p>
                                        )}
                                    </div>
                                )}

                                {userRole === "aluno" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                                        <div>
                                            <h4 className="font-bold mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">Os Meus Professores</h4>
                                            <div className="space-y-3">
                                                {turma.professores?.length > 0 ? turma.professores.map(p => (
                                                    <div key={p.id} className="flex items-center space-x-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-3 rounded-lg">
                                                        <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center overflow-hidden font-bold text-xs text-blue-800 dark:text-blue-200">
                                                            {p.foto_perfil ? <img src={p.foto_perfil} className="w-full h-full object-cover" alt="img"/> : p.name.charAt(0)}
                                                        </div>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{p.name}</span>
                                                    </div>
                                                )) : <p className="text-gray-500 italic">Sem professores associados.</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-bold mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">Alunos</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {turma.alunos?.length > 0 ? turma.alunos.filter(a => a.id !== auth.user.id).map(a => (
                                                    <div key={a.id} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 rounded-lg">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center overflow-hidden font-bold text-xs">
                                                            {a.foto_perfil ? <img src={a.foto_perfil} className="w-full h-full object-cover" alt="img"/> : a.name.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{a.name}</span>
                                                    </div>
                                                )) : <p className="text-gray-500 italic">És o único aluno nesta turma.</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <span className="text-5xl mb-4 block opacity-50">📭</span>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Nenhuma Turma Encontrada</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {userRole === "admin" ? "Usa o formulário acima para criar a primeira turma." : "Ainda não foste associado a nenhuma turma pela Secretaria."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // ==========================================
        // 3. VISTA DA SECRETARIA (USERS)
        // ==========================================
        if (activeView === "utilizadores") {
            return (
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Gestão de Utilizadores</h3>
                            <button onClick={() => setShowNovoUserForm(!showNovoUserForm)} className={`${showNovoUserForm ? "bg-gray-500" : "bg-blue-600"} text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors`}>
                                {showNovoUserForm ? "Cancelar e Fechar" : "+ Nova Conta Institucional"}
                            </button>
                        </div>

                        {showNovoUserForm && (
                            <form onSubmit={submitNovoUtilizador} className="mb-8 bg-blue-50/50 dark:bg-gray-700/50 border border-blue-100 dark:border-gray-600 p-6 rounded-xl">
                                <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2"> Criar Credenciais Institucionais</h4>
                                
                                {/* UPLOAD FOTO SECRETARIA */}
                                <div className="mb-6 flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div 
                                        onClick={() => fileInputRefSecretaria.current.click()}
                                        className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-400 dark:border-gray-500"
                                    >
                                        {userD.foto_perfil ? (
                                            <img src={userD.foto_perfil} className="w-full h-full object-cover" alt="Foto" />
                                        ) : (
                                            <span className="text-2xl opacity-50">📷</span>
                                        )}
                                    </div>
                                    <div>
                                        <button type="button" onClick={() => fileInputRefSecretaria.current.click()} className="text-sm font-bold text-blue-600 dark:text-blue-400">Definir Fotografia (Opcional)</button>
                                        <p className="text-xs text-gray-500">A imagem será comprimida automaticamente.</p>
                                    </div>
                                    <input 
                                        type="file" ref={fileInputRefSecretaria} className="hidden" accept="image/*"
                                        onChange={handleFotoUpload} 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                                        <input type="text" value={userD.name} onChange={(e) => setUserD("name", e.target.value)} required className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ex: Rui Santos" />
                                        {errorsUser.name && <p className="text-red-500 text-xs mt-1">{errorsUser.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Conta</label>
                                        <select value={userD.role} onChange={(e) => setUserD("role", e.target.value)} className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                            <option value="aluno">Aluno / Estudante</option>
                                            <option value="professor">Professor / Docente</option>
                                            <option value="secretaria">Secretaria / Admin</option>
                                        </select>
                                    </div>
                                    {userD.role === "aluno" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nº Processo / ID</label>
                                                <input type="text" value={userD.numero_interno} onChange={(e) => setUserD("numero_interno", e.target.value)} required className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ex: 1542" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ano Entrada</label>
                                                <input type="text" value={userD.ano_entrada} onChange={(e) => setUserD("ano_entrada", e.target.value)} required className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ex: 2026" />
                                            </div>
                                        </>
                                    )}
                                    <div className={userD.role === "aluno" ? "lg:col-span-4" : "lg:col-span-2"}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Pessoal <span className="text-gray-400 font-normal">(opcional)</span></label>
                                        <input type="email" value={userD.email_pessoal} onChange={(e) => setUserD("email_pessoal", e.target.value)} className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ex: rui@gmail.com" />
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-stretch justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 mt-4 shadow-sm gap-4">
                                    <div className="flex flex-col gap-3 flex-1">
                                        <div>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Institucional Gerado</span>
                                            <div className="text-lg font-bold text-blue-700 dark:text-blue-400 mt-0.5">{getEmailGerado()}</div>
                                        </div>
                                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 rounded-lg flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium mb-1">🔑 Password provisória:</p>
                                                <code className="text-sm font-mono font-bold text-yellow-900 dark:text-yellow-300 tracking-wider">{userD.password}</code>
                                            </div>
                                            <button type="button" onClick={() => setUserD("password", gerarPassword())} className="text-xs bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-2 py-1 rounded transition-colors">🔄 Gerar nova</button>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={processingUser} className="w-full md:w-auto self-end bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">Criar Utilizador</button>
                                </div>
                            </form>
                        )}

                        <div className="overflow-x-auto mt-4">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50">
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm w-12">Foto</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Nome</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Email Institucional</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Cargo</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {utilizadores && utilizadores.map((u) => (
                                        <tr key={u.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden font-bold text-xs text-gray-600 dark:text-gray-300">
                                                    {u.foto_perfil ? <img src={u.foto_perfil} className="w-full h-full object-cover" alt="img"/> : u.name.charAt(0)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-200">{u.name}</td>
                                            <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">{u.email}</td>
                                            <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm capitalize">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.id_role === 1 ? 'bg-red-100 text-red-800' : u.id_role === 2 ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                                                    {u.id_role === 1 ? 'Secretaria' : u.id_role === 2 ? 'Professor' : 'Aluno'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 flex justify-end gap-3 items-center">
                                                <button onClick={() => setUserToView(u)} className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 text-sm font-bold transition-colors mt-1">Ver</button>
                                                <button onClick={() => setUserToEdit(u)} className="text-amber-600 hover:text-amber-800 dark:hover:text-amber-400 text-sm font-bold transition-colors mt-1">Editar</button>
                                                <button onClick={() => { setUserToDelete(u); setDeleteUserStep(1); }} className="text-red-600 hover:text-red-800 dark:hover:text-red-400 text-sm font-bold transition-colors mt-1">Apagar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        }

        // ==========================================
        // 4. VISTA DO PERFIL
        // ==========================================
        if (activeView === "perfil") {
            return (
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl border border-gray-100 dark:border-gray-700"><UpdateThemeForm className="max-w-xl" /></div>
                    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl border border-gray-100 dark:border-gray-700"><UpdateProfileInformationForm className="max-w-xl" /></div>
                    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl border border-gray-100 dark:border-gray-700"><UpdatePasswordForm className="max-w-xl" /></div>
                </div>
            );
        }

        // Vistas vazias / Em construção
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 border-dashed transition-colors">
                <span className="text-4xl mb-4 block opacity-50">🚧</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Página em Construção
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    A vista <strong>{activeView}</strong> será adicionada em breve.
                </p>
            </div>
        );
    };

    return (
        <AuthenticatedLayout 
            activeView={activeView} 
            onViewChange={setActiveView} 
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">ProGama Workspace</h2>}
        >
            <Head title="Dashboard" />
            
            {renderContent()}

            {/* ========================================== */}
            {/* MODAIS (VISUALIZAÇÃO, EDIÇÃO E ELIMINAÇÃO) */}
            {/* ========================================== */}

            {/* MODAL VER UTILIZADOR */}
            {userToView && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalhes do Utilizador</h2>
                            <button onClick={() => setUserToView(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-lg">✖</button>
                        </div>
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden font-bold text-3xl text-gray-600 dark:text-gray-300 mb-3 border-4 border-blue-100 dark:border-blue-900">
                                {userToView.foto_perfil ? <img src={userToView.foto_perfil} className="w-full h-full object-cover" alt="img"/> : userToView.name.charAt(0)}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{userToView.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold mt-1 ${userToView.id_role === 1 ? 'bg-red-100 text-red-800' : userToView.id_role === 2 ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                                {userToView.id_role === 1 ? 'Secretaria' : userToView.id_role === 2 ? 'Professor' : 'Aluno'}
                            </span>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Email Inst.:</span>
                                <span className="text-gray-900 dark:text-gray-200 font-bold">{userToView.email}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Email Pessoal:</span>
                                <span className="text-gray-900 dark:text-gray-200 font-bold">{userToView.email_pessoal || 'N/A'}</span>
                            </div>
                            {userToView.id_role === 3 && (
                                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Nº Processo:</span>
                                    <span className="text-gray-900 dark:text-gray-200 font-bold">{userToView.nmr_processo_interno || 'N/A'}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Nível / XP:</span>
                                <span className="text-gray-900 dark:text-gray-200 font-bold">Nível {userToView.id_nivel || 1} ({userToView.xp_total || 0} XP)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Criado em:</span>
                                <span className="text-gray-900 dark:text-gray-200 font-bold">{new Date(userToView.created_at).toLocaleDateString('pt-PT')}</span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setUserToView(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 transition-colors w-full">Fechar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL EDITAR UTILIZADOR */}
            {userToEdit && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={submitEditUser} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Editar Utilizador</h2>
                        <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nome Completo:
                            <input type="text" value={userToEdit.name} onChange={e => setUserToEdit({...userToEdit, name: e.target.value})} className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600" />
                        </label>
                        <label className="block mb-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Cargo no Sistema:
                            <select value={userToEdit.id_role} onChange={e => setUserToEdit({...userToEdit, id_role: parseInt(e.target.value)})} className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600">
                                <option value={3}>Aluno</option>
                                <option value={2}>Professor</option>
                                <option value={1}>Secretaria / Admin</option>
                            </select>
                        </label>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setUserToEdit(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 transition-colors">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-colors">Guardar</button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL APAGAR UTILIZADOR COM DUPLO AVISO */}
            {userToDelete && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-lg border border-red-200 dark:border-red-900">
                        
                        {deleteUserStep === 1 && (
                            <>
                                <div className="text-red-500 mb-4 text-4xl">⚠️</div>
                                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Aviso 1: Apagar Utilizador?</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Estás prestes a apagar <strong>{userToDelete.name}</strong> ({userToDelete.email}). 
                                    Esta ação irá remover permanentemente todos os registos do utilizador da base de dados.
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setUserToDelete(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 transition-colors">Cancelar</button>
                                    <button onClick={() => setDeleteUserStep(2)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors">Estou ciente, continuar</button>
                                </div>
                            </>
                        )}

                        {deleteUserStep === 2 && (
                            <>
                                <div className="text-red-600 mb-4 text-4xl">🚨</div>
                                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Aviso 2: Destruição do cPanel</h2>
                                <p className="text-red-600 font-bold mb-4">
                                    Ao avançar, a caixa de email institucional <u>será destruída permanentemente no cPanel</u> sem hipótese de recuperação.
                                </p>

                                {userToDelete.email_pessoal ? (
                                    <p className="text-gray-700 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                        📧 Será enviado um aviso automático sobre o fecho da conta para o email pessoal registado:<br/>
                                        <strong className="text-blue-600 dark:text-blue-400">{userToDelete.email_pessoal}</strong>
                                    </p>
                                ) : (
                                    <p className="text-amber-700 dark:text-amber-400 mb-6 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                                        ⚠️ Este utilizador não tem um email pessoal registado na base de dados. Não será enviada nenhuma notificação.
                                    </p>
                                )}

                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setUserToDelete(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 transition-colors">Abortar</button>
                                    <button onClick={confirmDeleteUser} className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold uppercase shadow-sm transition-colors">Sim, Apagar Tudo</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL EDITAR TURMA */}
            {turmaToEdit && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={submitEditTurma} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Editar Turma</h2>
                        <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nome da Turma:
                            <input type="text" value={turmaToEdit.nome} onChange={e => setTurmaToEdit({...turmaToEdit, nome: e.target.value})} className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600" />
                        </label>
                        <label className="block mb-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Ano Letivo:
                            <input type="text" value={turmaToEdit.ano_letivo} onChange={e => setTurmaToEdit({...turmaToEdit, ano_letivo: e.target.value})} className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600" />
                        </label>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setTurmaToEdit(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 transition-colors">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-colors">Guardar</button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL APAGAR TURMA */}
            {turmaToDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-red-200 dark:border-red-900">
                        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Apagar Turma?</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Tens a certeza que queres apagar a turma <strong>{turmaToDelete.nome}</strong>? Os alunos e professores alocados vão ficar sem esta turma, mas as suas contas não serão apagadas.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setTurmaToDelete(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 transition-colors">Cancelar</button>
                            <button onClick={confirmDeleteTurma} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors">Apagar Turma</button>
                        </div>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}

function DashboardCard({ title, value, sub, color }) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-all duration-200">
            <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
                <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
            </div>
            <div className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">{sub}</div>
        </div>
    );
}