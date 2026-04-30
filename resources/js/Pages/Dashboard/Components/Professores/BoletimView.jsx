import React from "react";

const BoletimView = ({ notasAluno = [] }) => {
    // Cálculo simples de média para demonstração
    const mediaGeral =
        notasAluno.length > 0
            ? (
                  notasAluno.reduce((acc, curr) => acc + curr.valor, 0) /
                  notasAluno.length
              ).toFixed(1)
            : "0.0";

    return (
        <div className="space-y-6">
            {/* Header com Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-sm">
                    <p className="text-indigo-100 text-sm font-medium">
                        Média Global
                    </p>
                    <h2 className="text-3xl font-bold">
                        {mediaGeral} <span className="text-lg">Valores</span>
                    </h2>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        Avaliações Concluídas
                    </p>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {notasAluno.length}
                    </h2>
                </div>
            </div>

            {/* Tabela de Notas */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Histórico de Avaliações
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 font-semibold">
                                    Disciplina / Avaliação
                                </th>
                                <th className="px-6 py-4 font-semibold text-center">
                                    Data
                                </th>
                                <th className="px-6 py-4 font-semibold text-center">
                                    Peso
                                </th>
                                <th className="px-6 py-4 font-semibold text-center">
                                    Nota
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {notasAluno.length > 0 ? (
                                notasAluno.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800 dark:text-gray-200">
                                                {item.teste?.disciplina?.nome ||
                                                    "Geral"}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {item.teste?.titulo}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                                            {new Date(
                                                item.created_at,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                                            {item.teste?.peso_avaliacao}%
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${
                                                    item.valor >= 10
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {item.valor}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        Ainda não tens avaliações registadas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BoletimView;
