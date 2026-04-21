// resources/js/Pages/Dashboard/Partials/UserTable.jsx
import React from "react";

export default function UserTable({ utilizadores, onView, onEdit, onDelete }) {
    return (
        <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50">
                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm w-12">
                            Foto
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">
                            Nome
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">
                            Email Institucional
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">
                            Cargo
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm text-right">
                            Ações
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {utilizadores &&
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
                        ))}
                </tbody>
            </table>
        </div>
    );
}
