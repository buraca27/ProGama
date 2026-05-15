import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function MostrarSubmissaoView({ submissao, aluno, desafio, respostas }) {
  const [editMode, setEditMode] = useState(false);
  const { data, setData, post, processing, errors } = useForm({
    nota: submissao.nota || 0,
    feedback_professor: submissao.feedback_professor || '',
    estado: submissao.estado || 'Avaliado',
    respostas: respostas.map(r => ({
      id: r.id,
      correta: r.correta,
      pontuacao: r.pontuacao || 0,
      comentario_formador: r.comentario_formador || '',
    })),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(`/dashboard/professor/submissoes/${submissao.id}/avaliar`, {
      onSuccess: () => {
        setEditMode(false);
        alert('Avaliação guardada com sucesso!');
      },
    });
  };

  const updateResposta = (index, campo, valor) => {
    const novasRespostas = [...data.respostas];
    novasRespostas[index] = { ...novasRespostas[index], [campo]: valor };
    setData('respostas', novasRespostas);
  };

  const estadosBadges = {
    'Pendente': 'bg-yellow-100 text-yellow-800',
    'Em_Resolucao': 'bg-blue-100 text-blue-800',
    'Submetido': 'bg-orange-100 text-orange-800',
    'Avaliado': 'bg-green-100 text-green-800',
    'Concluido': 'bg-green-200 text-green-900',
  };

  const tiposPergunta = {
    'Escolha_Multipla': '📋 Escolha Múltipla',
    'Verdadeiro_Falso': '✓/✗ Verdadeiro/Falso',
    'Dissertativa': '📝 Dissertativa',
  };

  return (
    <ProfessorLayout>
      <Head title={`Corrigir - ${aluno.nome}`} />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center gap-2">
              ← Voltar
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Info Aluno */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-slate-400 text-sm font-semibold mb-2">Aluno</h3>
                <h1 className="text-2xl font-bold text-white mb-2">{aluno.nome}</h1>
                <p className="text-slate-400 text-sm">{aluno.email}</p>
              </div>

              {/* Info Desafio */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-slate-400 text-sm font-semibold mb-2">Desafio</h3>
                <h1 className="text-2xl font-bold text-white mb-2">{desafio.titulo}</h1>
                <p className="text-slate-400 text-sm">Tipo: {desafio.tipo}</p>
              </div>
            </div>

            {/* Status Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-xs font-semibold mb-1">Estado</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${estadosBadges[submissao.estado] || 'bg-slate-700 text-slate-300'}`}>
                  {submissao.estado.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-xs font-semibold mb-1">Nota Atual</p>
                <p className="text-2xl font-bold text-white">
                  {submissao.nota !== null ? submissao.nota.toFixed(1) : '—'} <span className="text-sm text-slate-400">/20</span>
                </p>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-xs font-semibold mb-1">Tentativa</p>
                <p className="text-2xl font-bold text-white">#{submissao.numero_tentativa}</p>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-xs font-semibold mb-1">Submetido</p>
                <p className="text-xs text-slate-300">
                  {new Date(submissao.data_submissao).toLocaleString('pt-PT')}
                </p>
              </div>
            </div>
          </div>

          {/* Respostas */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-6">Respostas do Aluno</h2>

            <div className="space-y-6">
              {respostas.map((resposta, index) => (
                <div key={resposta.id} className="bg-slate-700 rounded-lg p-5 border border-slate-600">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-slate-300 text-xs font-semibold mb-1">
                        {tiposPergunta[resposta.tipo_pergunta] || 'Pergunta'}
                      </p>
                      <p className="text-white font-semibold">{resposta.pergunta_texto}</p>
                    </div>
                  </div>

                  {/* Resposta do Aluno */}
                  <div className="bg-slate-800 rounded p-3 mb-4">
                    <p className="text-slate-400 text-xs font-semibold mb-1">Resposta do Aluno</p>
                    <p className="text-slate-200">{resposta.resposta_aluno || '(Sem resposta)'}</p>
                  </div>

                  {/* Campos de Correção */}
                  {editMode && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-1">
                          Correta?
                        </label>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`correta-${index}`}
                              checked={data.respostas[index]?.correta === true}
                              onChange={() => updateResposta(index, 'correta', true)}
                              className="w-4 h-4"
                            />
                            <span className="text-slate-300">✓ Sim</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`correta-${index}`}
                              checked={data.respostas[index]?.correta === false}
                              onChange={() => updateResposta(index, 'correta', false)}
                              className="w-4 h-4"
                            />
                            <span className="text-slate-300">✗ Não</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-1">
                          Pontuação (0-20)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={data.respostas[index]?.pontuacao || 0}
                          onChange={(e) => updateResposta(index, 'pontuacao', parseInt(e.target.value))}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-1">
                          Comentário do Professor
                        </label>
                        <textarea
                          value={data.respostas[index]?.comentario_formador || ''}
                          onChange={(e) => updateResposta(index, 'comentario_formador', e.target.value)}
                          rows="2"
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm resize-none"
                          placeholder="(Opcional)"
                        />
                      </div>
                    </div>
                  )}

                  {/* Visualização modo leitura */}
                  {!editMode && (
                    <div className="space-y-2">
                      {resposta.correta !== null && (
                        <p className={`text-xs font-semibold ${resposta.correta ? 'text-green-400' : 'text-red-400'}`}>
                          {resposta.correta ? '✓ Correta' : '✗ Incorreta'}
                        </p>
                      )}
                      {resposta.pontuacao !== null && (
                        <p className="text-slate-400 text-xs">Pontuação: <span className="text-white font-semibold">{resposta.pontuacao}/20</span></p>
                      )}
                      {resposta.comentario_formador && (
                        <div className="bg-slate-800 rounded p-2 mt-2">
                          <p className="text-slate-300 text-xs">💬 {resposta.comentario_formador}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Geral */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Feedback Geral</h2>

            {editMode ? (
              <textarea
                value={data.feedback_professor}
                onChange={(e) => setData('feedback_professor', e.target.value)}
                rows="4"
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white placeholder-slate-500 text-sm"
                placeholder="Escreve feedback geral para o aluno..."
              />
            ) : (
              <div className="bg-slate-700 rounded p-4">
                <p className="text-slate-300">
                  {submissao.feedback_professor || '(Sem feedback ainda)'}
                </p>
              </div>
            )}
          </div>

          {/* Nota Final */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Nota Final</h2>

            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm font-semibold mb-2">
                    Nota (0-20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={data.nota}
                    onChange={(e) => setData('nota', parseFloat(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white text-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-semibold mb-2">
                    Estado da Submissão
                  </label>
                  <select
                    value={data.estado}
                    onChange={(e) => setData('estado', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white"
                  >
                    <option value="Submetido">Submetido</option>
                    <option value="Avaliado">Avaliado</option>
                    <option value="Concluido">Concluído</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-5xl font-bold text-white">
                  {data.nota.toFixed(1)} <span className="text-sm text-slate-400">/20</span>
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  Estado: <span className="text-slate-200 font-semibold">{data.estado.replace(/_/g, ' ')}</span>
                </p>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
                >
                  ✏️ Editar Avaliação
                </button>
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors inline-block"
                >
                  Voltar
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={processing}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {processing ? 'A guardar...' : '💾 Guardar Avaliação'}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
}
