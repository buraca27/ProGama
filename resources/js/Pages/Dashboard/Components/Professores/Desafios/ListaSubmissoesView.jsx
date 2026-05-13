import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';


export default function ListaSubmissoesView({ desafio, submissoes }) {
  const estadosPendentes = useMemo(() => {
    return submissoes.filter(sub => sub.estado === 'Submetido' || sub.estado === 'Em_Resolucao').length;
  }, [submissoes]);

  const estadosBadges = {
    'Pendente': 'bg-yellow-100 text-yellow-800',
    'Em_Resolucao': 'bg-blue-100 text-blue-800',
    'Submetido': 'bg-orange-100 text-orange-800',
    'Avaliado': 'bg-green-100 text-green-800',
    'Falhado': 'bg-red-100 text-red-800',
    'Concluido': 'bg-green-200 text-green-900',
  };

  return (
    <ProfessorLayout>
      <Head title={`Submissões - ${desafio.titulo}`} />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center gap-2">
              ← Voltar
            </Link>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h1 className="text-3xl font-bold text-white mb-2">{desafio.titulo}</h1>
              <p className="text-slate-400 text-sm">
                Tipo: <span className="text-slate-200 font-semibold">{desafio.tipo}</span>
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Submissões pendentes: <span className="text-orange-400 font-bold">{estadosPendentes}</span>
              </p>
            </div>
          </div>

          {/* Submissões */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            {submissoes.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-400">Nenhuma submissão encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700 border-b border-slate-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Aluno</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Email</th>
                      <th className="px-6 py-3 text-center text-slate-300 font-semibold">Tentativa</th>
                      <th className="px-6 py-3 text-center text-slate-300 font-semibold">Estado</th>
                      <th className="px-6 py-3 text-center text-slate-300 font-semibold">Nota</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Submissão</th>
                      <th className="px-6 py-3 text-center text-slate-300 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {submissoes.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-700 transition-colors">
                        <td className="px-6 py-4 text-slate-200 font-medium">{sub.aluno_nome}</td>
                        <td className="px-6 py-4 text-slate-400">{sub.aluno_email}</td>
                        <td className="px-6 py-4 text-center text-slate-300">#{sub.numero_tentativa}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadosBadges[sub.estado] || 'bg-slate-700 text-slate-300'}`}>
                            {sub.estado.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {sub.nota !== null ? (
                            <span className={`font-bold ${sub.nota >= 10 ? 'text-green-400' : sub.nota >= 7 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {sub.nota.toFixed(1)}/20
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {sub.data_submissao ? new Date(sub.data_submissao).toLocaleString('pt-PT') : '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link
                            href={`/dashboard/professor/submissoes/${sub.id}`}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded transition-colors"
                          >
                            Ver & Corrigir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
}
