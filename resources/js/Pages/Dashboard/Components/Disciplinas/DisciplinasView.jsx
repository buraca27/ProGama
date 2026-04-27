import React, { useState } from "react";
import { useForm, router } from "@inertiajs/react";
import DisciplinasAdminEditor from "./DisciplinasAdminEditor";

export default function DisciplinasView({ disciplinas, turmas, utilizadores, userRole }) {
    // ==========================================
    // ESTADOS DOS MODAIS E FILTRO
    // ==========================================
    const [disciplinaToEdit, setDisciplinaToEdit] = useState(null);
    const [disciplinaToDelete, setDisciplinaToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // ==========================================
    // LÓGICA DO FORMULÁRIO DE CRIAR DISCIPLINAS
    // ==========================================
    const { 
        data: disciplinaD, 
        setData: setDisciplinaD, 
        post: postDisciplina, 
        processing: processingDisciplina, 
        reset: resetDisciplina 
    } = useForm({ 
        nome: "",
        codigo: "",      
        descricao: ""
    });

    const submitNovaDisciplina = (e) => {
        e.preventDefault();
        postDisciplina(route("disciplinas.store"), { 
            preserveScroll: true, 
            onSuccess: () => resetDisciplina() 
        });
    };

    // ==========================================
    // LÓGICA DE EDITAR E APAGAR DISCIPLINAS
    // ==========================================
    const submitEditDisciplina = (e) => {
    e.preventDefault();
    router.put(`/dashboard/disciplinas/${disciplinaToEdit.id}`, { 
        nome: disciplinaToEdit.nome,
        codigo: disciplinaToEdit.codigo || "",
        descricao: disciplinaToEdit.descricao || ""
        }, {
            preserveScroll: true,
            onSuccess: () => setDisciplinaToEdit(null)
        });
    };

    const confirmDeleteDisciplina = () => {
        router.delete(`/dashboard/disciplinas/${disciplinaToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setDisciplinaToDelete(null)
        });
    };

    // ==========================================
    // LÓGICA DO FILTRO DE PESQUISA
    // ==========================================
    const filteredDisciplinas = disciplinas ? disciplinas.filter((d) => {
        const search = searchTerm.toLowerCase();
        return d.nome.toLowerCase().includes(search);
    }) : [];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            
            {/* ---------------------------------------------------------
                1. FORMULÁRIO DE CRIAÇÃO (APENAS PARA ADMIN)
            --------------------------------------------------------- */}
            {userRole === "admin" && (
                <form 
                    onSubmit={submitNovaDisciplina} 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col gap-4"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nome da Disciplina *
                            </label>
                            <input 
                                type="text" 
                                value={disciplinaD.nome} 
                                onChange={e => setDisciplinaD("nome", e.target.value)} 
                                required 
                                placeholder="Ex: Programação Web" 
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500" 
                            />
                        </div>
                        <div className="md:w-48">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Código
                            </label>
                            <input 
                                type="text" 
                                value={disciplinaD.codigo} 
                                onChange={e => setDisciplinaD("codigo", e.target.value)} 
                                placeholder="Ex: MAT10, PT12" 
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descrição
                        </label>
                        <textarea 
                            value={disciplinaD.descricao} 
                            onChange={e => setDisciplinaD("descricao", e.target.value)} 
                            placeholder="Breve descrição da disciplina (opcional)" 
                            rows={2}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                    <div className="flex justify-end">
                        <button 
                            disabled={processingDisciplina} 
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-bold shadow-sm transition-colors"
                        >
                            + Adicionar Disciplina
                        </button>
                    </div>
                </form>
            )}

            {/* ---------------------------------------------------------
                2. BARRA DE PESQUISA (TODOS OS ROLES)
            --------------------------------------------------------- */}
            {disciplinas && disciplinas.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                    <input
                        type="text"
                        placeholder="Pesquisar disciplina por nome..."
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
                3. LISTAGEM DE DISCIPLINAS
            --------------------------------------------------------- */}
            {filteredDisciplinas.length > 0 ? (
                filteredDisciplinas.map((disciplina) => (
                    <div
                        key={disciplina.id}
                        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        {/* CABEÇALHO DA DISCIPLINA */}
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                                {disciplina.nome}
                                {disciplina.codigo && (
                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                                        ({disciplina.codigo})
                                    </span>
                                )}
                            </h3>
                            
                            {/* Botões Admin */}
                            {userRole === "admin" && (
                                <div className="flex gap-2">
                                    <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs px-3 py-1 rounded-full font-bold flex items-center mr-2">
                                        {disciplina.turmas?.length || 0} Turmas
                                    </span>
                                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-3 py-1 rounded-full font-bold flex items-center mr-2">
                                        {disciplina.professores?.length || 0} Professores
                                    </span>
                                    <button 
                                        onClick={() => setDisciplinaToEdit(disciplina)} 
                                        className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1 rounded font-bold text-sm transition-colors"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => setDisciplinaToDelete(disciplina)} 
                                        className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded font-bold text-sm transition-colors"
                                    >
                                        Apagar
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ÁREA DE ADMIN: Editor de Atribuições */}
                        {userRole === "admin" && (
                            <div className="mt-4">
                                <DisciplinasAdminEditor
                                    disciplina={disciplina}
                                    utilizadores={utilizadores}
                                    turmas={turmas}
                                />
                            </div>
                        )}

                        {/* ÁREA DE ALUNO/PROFESSOR: Lista de Professores e Turmas */}
                        {userRole !== "admin" && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Professores */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                                        Professores
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {disciplina.professores && disciplina.professores.length > 0 ? (
                                            disciplina.professores.map((prof) => (
                                                <div key={prof.id} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                                                        {prof.foto_perfil ? <img src={prof.foto_perfil} alt={prof.name} className="w-full h-full object-cover" /> : prof.name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{prof.name}</p>
                                                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-tighter">Docente</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 italic text-sm">Sem professores atribuídos.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Turmas */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                                        Turmas
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {disciplina.turmas && disciplina.turmas.length > 0 ? (
                                            disciplina.turmas.map((t) => (
                                                <span key={t.id} className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-md text-sm font-bold border border-purple-100 dark:border-purple-800">
                                                    {t.nome}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 italic text-sm">Nenhuma turma associada.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors">
                    <span className="text-5xl mb-4 block opacity-50">📚</span>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Nenhuma Disciplina Encontrada
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {searchTerm 
                            ? "Não encontrámos nenhuma disciplina com essa pesquisa." 
                            : (userRole === "admin" 
                                ? "Usa o formulário acima para criar a primeira disciplina." 
                                : "De momento, não existem disciplinas disponíveis.")}
                    </p>
                </div>
            )}

            {/* =========================================================
                MODAIS DE ADMINISTRAÇÃO (EDITAR / APAGAR)
            ========================================================= */}

            {/* MODAL EDITAR DISCIPLINA */}
            {disciplinaToEdit && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <form onSubmit={submitEditDisciplina} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Editar Disciplina</h2>
                            <div className="space-y-4 mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nome *
                                    <input 
                                        type="text" 
                                        value={disciplinaToEdit.nome} 
                                        onChange={e => setDisciplinaToEdit({...disciplinaToEdit, nome: e.target.value})} 
                                        className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" 
                                    />
                                </label>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Código
                                    <input 
                                        type="text" 
                                        value={disciplinaToEdit.codigo || ""} 
                                        onChange={e => setDisciplinaToEdit({...disciplinaToEdit, codigo: e.target.value})} 
                                        placeholder="Ex: MAT10"
                                        className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" 
                                    />
                                </label>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Descrição
                                    <textarea 
                                        value={disciplinaToEdit.descricao || ""} 
                                        onChange={e => setDisciplinaToEdit({...disciplinaToEdit, descricao: e.target.value})} 
                                        rows={3}
                                        placeholder="Breve descrição da disciplina (opcional)"
                                        className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" 
                                    />
                                </label>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setDisciplinaToEdit(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 transition-colors">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-colors">Guardar Alterações</button>
                            </div>
                        </form>
                    </div>
                )}

            {/* MODAL APAGAR DISCIPLINA */}
            {disciplinaToDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-red-200 dark:border-red-900">
                        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Apagar Disciplina?</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Tens a certeza que queres apagar a disciplina <strong>{disciplinaToDelete.nome}</strong>? As associações a turmas e professores serão perdidas.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDisciplinaToDelete(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 transition-colors">Cancelar</button>
                            <button onClick={confirmDeleteDisciplina} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors shadow-sm">Sim, Apagar Disciplina</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}