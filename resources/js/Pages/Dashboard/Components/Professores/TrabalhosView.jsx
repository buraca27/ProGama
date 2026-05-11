import React from "react";

export default function TrabalhosView({ correcoesProfessor = [] }) {
    const testesRealizados = Array.isArray(correcoesProfessor)
        ? correcoesProfessor
        : [];

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Testes Realizados pelos Alunos
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Aqui aparecem os testes que os alunos realizaram e suas
                    correções.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                {testesRealizados.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Nenhum teste realizado pelos alunos neste momento.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {testesRealizados.map((testeRealizado) => (
                            <div
                                key={testeRealizado.id}
                                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                            >
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                    {testeRealizado.teste?.titulo ||
                                        "Teste sem título"}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    Aluno:{" "}
                                    {testeRealizado.aluno?.name ||
                                        "Nome não disponível"}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Status:{" "}
                                    {testeRealizado.estado ||
                                        "Status desconhecido"}
                                </p>
                                {testeRealizado.created_at && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Realizado em:{" "}
                                        {new Date(
                                            testeRealizado.created_at,
                                        ).toLocaleString("pt-PT")}
                                    </p>
                                )}
                                {/* Detalhes da pontuação */}
                                {testeRealizado.respostas && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Pontuação:{" "}
                                        {testeRealizado.respostas.reduce(
                                            (acc, resp) =>
                                                acc +
                                                (resp.pontuacao_obtida || 0),
                                            0,
                                        )}{" "}
                                        /{" "}
                                        {testeRealizado.teste?.perguntas
                                            ?.length || 0}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
