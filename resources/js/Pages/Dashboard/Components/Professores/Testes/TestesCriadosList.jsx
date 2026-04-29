import React from "react";

export default function TestesCriadosList({
    testesProfessor,
    carregarTesteNoEditor,
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Testes Criados
            </h3>
            <div className="space-y-3">
                {testesProfessor.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ainda não criaste nenhum teste.
                    </p>
                )}
                {testesProfessor.map((teste) => (
                    <div
                        key={teste.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                            {teste.titulo}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {teste.tipo_avaliacao.replaceAll("_", " ")} |{" "}
                            {teste.perguntas?.length || 0} perguntas
                        </p>
                        <div className="mt-3">
                            <button
                                type="button"
                                onClick={() => carregarTesteNoEditor(teste)}
                                className="px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-semibold"
                            >
                                Editar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
