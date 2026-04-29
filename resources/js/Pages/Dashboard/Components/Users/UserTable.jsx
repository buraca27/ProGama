import React from "react";
import { router } from "@inertiajs/react";

export default function UserTable({ utilizadores, onView, onEdit, onDelete, requestSort, sortConfig }) {
    
    // Função para mostrar a setinha correspondente na coluna
    const getSortIcon = (key) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="ml-1 opacity-20 group-hover:opacity-100 transition-opacity">↕</span>;
        }
        return sortConfig.direction === 'asc' 
            ? <span className="ml-1 text-blue-600 dark:text-blue-400 font-bold">↑</span> 
            : <span className="ml-1 text-blue-600 dark:text-blue-400 font-bold">↓</span>;
    };

    return (
        <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50">
                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm w-12">
                            Foto
                        </th>
                        <th 
                            onClick={() => requestSort('name')} 
                            className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm cursor-pointer group hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors select-none"
                        >
                            Nome {getSortIcon('name')}
                        </th>
                        <th 
                            onClick={() => requestSort('email')} 
                            className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm cursor-pointer group hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors select-none"
                        >
                            Email Institucional {getSortIcon('email')}
                        </th>
                        <th 
                            onClick={() => requestSort('id_role')} 
                            className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm cursor-pointer group hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors select-none"
                        >
                            Cargo {getSortIcon('id_role')}
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm text-right">
                            Ações
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {utilizadores && utilizadores.length > 0 ? (
                        utilizadores.map((u) => (
                            <tr
                                key={u.id}
                                className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <td className="py-3 px-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden font-bold text-xs text-gray-600 dark:text-gray-300">
                                        {u.foto_perfil ? (
                                            <img
                                                src={u.foto_perfil}
                                                className="w-full h-full object-cover"
                                                alt="img"
                                            />
                                        ) : (
                                            u.name.charAt(0)
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-200">
                                    {u.name}
                                </td>
                                <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">
                                    {u.email}
                                </td>
                                <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm capitalize">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-bold ${u.id_role === 1 ? "bg-red-100 text-red-800" : u.id_role === 2 ? "bg-indigo-100 text-indigo-800" : "bg-green-100 text-green-800"}`}
                                    >
                                        {u.id_role === 1
                                            ? "Secretaria"
                                            : u.id_role === 2
                                              ? "Professor"
                                              : "Aluno"}
                                    </span>
                                </td>
                                <td className="py-3 px-4 flex justify-end gap-3 items-center">
                                    <button
                                        onClick={() => {
                                            if (confirm(`Enviar pedido de recuperação de password para ${u.name}? (Será enviado para o email pessoal).`)) {
                                                router.post(route('utilizadores.reset-password', u.id));
                                            }
                                        }}
                                        title="Enviar pedido de reset para o Email Pessoal"
                                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-bold transition-colors"
                                    >
                                        Reset PW
                                    </button>
                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                    <button
                                        onClick={() => onView(u)}
                                        className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 text-sm font-bold transition-colors"
                                    >
                                        Ver
                                    </button>
                                    <button
                                        onClick={() => onEdit(u)}
                                        className="text-amber-600 hover:text-amber-800 dark:hover:text-amber-400 text-sm font-bold transition-colors"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => onDelete(u)}
                                        className="text-red-600 hover:text-red-800 dark:hover:text-red-400 text-sm font-bold transition-colors"
                                    >
                                        Apagar
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center py-10 text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800/50">
                                Nenhum utilizador encontrado com esses termos de pesquisa. 🔍
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}