import React, { useState } from "react";
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
    // ==========================================
    // STATES DE FILTRO E ORDENAÇÃO
    // ==========================================
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("todos");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    // --- 1. LÓGICA DE FILTROS (PESQUISA + CARGO) ---
    const filteredUsers = utilizadores ? utilizadores.filter((u) => {
        // Filtro de Texto Seguro (protege contra nulls)
        const search = searchTerm.toLowerCase();
        const roleName = u.id_role === 1 ? 'secretaria' : u.id_role === 2 ? 'professor' : 'aluno';
        
        const safeName = u.name ? u.name.toLowerCase() : "";
        const safeEmail = u.email ? u.email.toLowerCase() : "";

        const matchesSearch = 
            safeName.includes(search) ||
            safeEmail.includes(search) ||
            roleName.includes(search);

        // Filtro de Cargo Seguro (String(u.id_role) evita o erro de .toString() em null)
        const matchesRole = roleFilter === "todos" || String(u.id_role) === roleFilter;

        return matchesSearch && matchesRole;
    }) : [];

    // --- 2. LÓGICA DE ORDENAÇÃO (CLIQUE NO CABEÇALHO) ---
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        let aValue = a[sortConfig.key] || ""; // fallback para string vazia
        let bValue = b[sortConfig.key] || "";

        if (sortConfig.key === 'id_role') {
            aValue = a.id_role === 1 ? 'Secretaria' : a.id_role === 2 ? 'Professor' : 'Aluno';
            bValue = b.id_role === 1 ? 'Secretaria' : b.id_role === 2 ? 'Professor' : 'Aluno';
        } else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                
                {/* CABEÇALHO COM FILTROS E BOTÃO */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white shrink-0">
                        Gestão de Utilizadores
                    </h3>
                    
                    <div className="flex flex-col md:flex-row w-full xl:w-auto items-stretch md:items-center gap-3">
                        {/* 1. BARRA DE PESQUISA (TEXTO) */}
                        <div className="relative flex-1 md:w-64">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Pesquisar..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                            />
                        </div>

                        {/* 2. FILTRO POR CARGO (DROPDOWN) */}
                        <select 
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                            className="w-full md:w-48 py-2 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                        >
                            <option value="todos">Todos os Cargos</option>
                            <option value="1">Secretaria (Admins)</option>
                            <option value="2">Professores</option>
                            <option value="3">Alunos</option>
                        </select>

                        {/* 3. BOTÃO NOVO UTILIZADOR */}
                        <button
                            onClick={() => setShowNovoUserForm(!showNovoUserForm)}
                            className={`${showNovoUserForm ? "bg-gray-500 hover:bg-gray-600" : "bg-blue-600 hover:bg-blue-700"} text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors whitespace-nowrap shrink-0`}
                        >
                            {showNovoUserForm ? "Fechar" : "+ Nova Conta"}
                        </button>
                    </div>
                </div>

                {showNovoUserForm && (
                    <CreateUserForm
                        onSuccess={() => setShowNovoUserForm(false)}
                    />
                )}

                {/* TABELA DE UTILIZADORES */}
                <UserTable
                    utilizadores={sortedUsers}
                    onView={setUserToView}
                    onEdit={setUserToEdit}
                    onDelete={(u) => {
                        setUserToDelete(u);
                        setDeleteUserStep(1);
                    }}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                />
            </div>
        </div>
    );
}