import React, { useState } from "react";
import { useForm, router } from "@inertiajs/react";
import TurmaAdminEditor from "./TurmaAdminEditor";

export default function TurmasView({ turmas, utilizadores, userRole }) {
    // ==========================================
    // ESTADOS DOS MODAIS E FILTRO
    // ==========================================
    const [turmaToEdit, setTurmaToEdit] = useState(null);
    const [turmaToDelete, setTurmaToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // <-- Novo estado para a pesquisa

    // ==========================================
    // LÓGICA DO FORMULÁRIO DE CRIAR TURMAS
    // ==========================================
    const { 
        data: turmaD, 
        setData: setTurmaD, 
        post: postTurma, 
        processing: processingTurma, 
        reset: resetTurma 
    } = useForm({ 
        nome: "", 
        ano_letivo: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1) 
    });

    const submitNovaTurma = (e) => {
        e.preventDefault();
        postTurma(route("turmas.store"), { 
            preserveScroll: true, 
            onSuccess: () => resetTurma() 
        });
    };

    // ==========================================
    // LÓGICA DE EDITAR E APAGAR TURMAS
    // ==========================================
    const submitEditTurma = (e) => {
        e.preventDefault();
        router.put(`/dashboard/turmas/${turmaToEdit.id}`, { 
            nome: turmaToEdit.nome, 
            ano_letivo: turmaToEdit.ano_letivo 
        }, {
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

    // ==========================================
    // LÓGICA DO FILTRO DE PESQUISA
    // ==========================================
    const filteredTurmas = turmas ? turmas.filter((t) => {
        const search = searchTerm.toLowerCase();
        return (
            t.nome.toLowerCase().includes(search) ||
            t.ano_letivo.toLowerCase().includes(search)
        );
    }) : [];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            
            {/* ---------------------------------------------------------
                1. FORMULÁRIO DE CRIAÇÃO (APENAS PARA ADMIN)
            --------------------------------------------------------- */}
            {userRole === "admin" && (
                <form 
                    onSubmit={submitNovaTurma} 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col md:flex-row gap-4 items-end"
                >
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome da Turma
                        </label>
                        <input 
                            type="text" 
                            value={turmaD.nome} 
                            onChange={e => setTurmaD("nome", e.target.value)} 
                            required 
                            placeholder="Ex: TPSI 10" 
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Ano Letivo
                        </label>
                        <input 
                            type="text" 
                            value={turmaD.ano_letivo} 
                            onChange={e => setTurmaD("ano_letivo", e.target.value)} 
                            required 
                            placeholder="Ex: 2026/2027" 
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                    <button 
                        disabled={processingTurma} 
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-bold w-full md:w-auto mt-4 md:mt-0 shadow-sm transition-colors"
                    >
                        + Adicionar Turma
                    </button>
                </form>
            )}

            {/* ---------------------------------------------------------
                2. BARRA DE PESQUISA (TODOS OS ROLES)
            --------------------------------------------------------- */}
            {turmas && turmas.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                    <input
                        type="text"
                        placeholder="Pesquisar turma por nome ou ano letivo..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 sm:text-sm"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-bold ml-2">
                            ✖
                        </button>
                    )}
                </div>
            )}

            {/* ---------------------------------------------------------
                3. LISTAGEM DE TURMAS (USANDO filteredTurmas)
            --------------------------------------------------------- */}
            {filteredTurmas.length > 0 ? (
                filteredTurmas.map((turma) => (
                    <div
                        key={turma.id}
                        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        {/* CABEÇALHO DA TURMA */}
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                                {turma.nome}{" "}
                                <span className="text-base font-normal text-gray-500 ml-2">
                                    ({turma.ano_letivo})
                                </span>
                            </h3>
                            
                            {/* Botões Admin ou Contador de Alunos */}
                            {userRole === "admin" ? (
                                <div className="flex gap-2">
                                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-3 py-1 rounded-full font-bold flex items-center mr-2">
                                        {turma.alunos?.length || 0} Alunos
                                    </span>
                                    <button 
                                        onClick={() => setTurmaToEdit(turma)} 
                                        className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1 rounded font-bold text-sm transition-colors"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => setTurmaToDelete(turma)} 
                                        className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded font-bold text-sm transition-colors"
                                    >
                                        Apagar
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800">
                                    {turma.alunos?.length || 0} Integrantes
                                </div>
                            )}
                        </div>

                        {/* ÁREA DE ADMIN: Editor de Atribuições */}
                        {userRole === "admin" && (
                            <div className="mt-4">
                                <TurmaAdminEditor
                                    turma={turma}
                                    utilizadores={utilizadores}
                                />
                            </div>
                        )}

                        {/* ÁREA DE ALUNO/PROFESSOR: Lista de Colegas/Alunos */}
                        {userRole !== "admin" && (
                            <div className="mt-6">
                                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                                    Membros da Turma
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {turma.alunos && turma.alunos.length > 0 ? (
                                        turma.alunos.map((aluno) => (
                                            <div
                                                key={aluno.id}
                                                className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
                                            >
                                                {/* Foto ou Inicial */}
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden shrink-0">
                                                    {aluno.foto_perfil ? (
                                                        <img
                                                            src={aluno.foto_perfil}
                                                            alt={aluno.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        aluno.name.charAt(0)
                                                    )}
                                                </div>
                                                {/* Nome e Cargo */}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                                                        {aluno.name}
                                                    </p>
                                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-tighter">
                                                        Estudante
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="col-span-full text-center py-6 text-gray-400 italic text-sm">
                                            Ainda não foram atribuídos membros a esta turma.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors">
                    <span className="text-5xl mb-4 block opacity-50">📭</span>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Nenhuma Turma Encontrada
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {searchTerm 
                            ? "Não encontrámos nenhuma turma com essa pesquisa. Tenta noutro ano letivo ou nome." 
                            : (userRole === "admin" 
                                ? "Usa o formulário acima para criar a primeira turma." 
                                : "De momento, não estás associado a nenhuma turma.")}
                    </p>
                </div>
            )}

            {/* =========================================================
                MODAIS DE ADMINISTRAÇÃO (EDITAR / APAGAR)
            ========================================================= */}

            {/* MODAL EDITAR TURMA */}
            {turmaToEdit && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={submitEditTurma} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Editar Turma</h2>
                        <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nome da Turma:
                            <input 
                                type="text" 
                                value={turmaToEdit.nome} 
                                onChange={e => setTurmaToEdit({...turmaToEdit, nome: e.target.value})} 
                                className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" 
                            />
                        </label>
                        <label className="block mb-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Ano Letivo:
                            <input 
                                type="text" 
                                value={turmaToEdit.ano_letivo} 
                                onChange={e => setTurmaToEdit({...turmaToEdit, ano_letivo: e.target.value})} 
                                className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" 
                            />
                        </label>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setTurmaToEdit(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 transition-colors">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-colors">Guardar Alterações</button>
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
                            <button onClick={confirmDeleteTurma} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors shadow-sm">Sim, Apagar Turma</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}