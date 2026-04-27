import React from 'react';
import { useForm } from '@inertiajs/react';

export default function EditUserForm({ user, turmas, onClose }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email_pessoal: user.email_pessoal || '',
        nmr_processo_interno: user.nmr_processo_interno || '',
        nif: user.nif || '',
        data_nascimento: user.data_nascimento || '',
        id_role: user.id_role || 3,
        id_turma: user.id_turma || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('utilizadores.update', user.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <form onSubmit={submit} className="p-6 space-y-4 bg-white dark:bg-gray-800 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div>
                    <label className="block text-sm font-medium dark:text-gray-200">Nome Completo</label>
                    <input 
                        type="text" 
                        value={data.name} 
                        onChange={e => setData('name', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                    />
                    {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                </div>

                {/* Email Pessoal */}
                <div>
                    <label className="block text-sm font-medium dark:text-gray-200">Email Pessoal</label>
                    <input 
                        type="email" 
                        value={data.email_pessoal} 
                        onChange={e => setData('email_pessoal', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* NIF e Data de Nascimento */}
                <div>
                    <label className="block text-sm font-medium dark:text-gray-200">NIF</label>
                    <input 
                        type="text" 
                        value={data.nif} 
                        maxLength="9"
                        onChange={e => setData('nif', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium dark:text-gray-200">Data de Nascimento</label>
                    <input 
                        type="date" 
                        value={data.data_nascimento} 
                        onChange={e => setData('data_nascimento', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Cargo */}
                <div>
                    <label className="block text-sm font-medium dark:text-gray-200">Cargo</label>
                    <select 
                        value={data.id_role} 
                        onChange={e => setData('id_role', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="1">Secretaria</option>
                        <option value="2">Professor</option>
                        <option value="3">Aluno</option>
                    </select>
                </div>

                {/* Turma (Apenas visível se for Aluno) */}
                {data.id_role == 3 && (
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-200">Turma</label>
                        <select 
                            value={data.id_turma} 
                            onChange={e => setData('id_turma', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Sem Turma</option>
                            {turmas.map(t => (
                                <option key={t.id} value={t.id}>{t.nome}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500">Cancelar</button>
                <button 
                    type="submit" 
                    disabled={processing}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
                >
                    {processing ? 'A guardar...' : 'Guardar Alterações'}
                </button>
            </div>
        </form>
    );
}