import { useEffect, useState } from 'react';

export default function Toast({ flash }) {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('success');

    useEffect(() => {
        if (flash?.success) {
            setMessage(flash.success);
            setType('success');
            setVisible(true);
        } else if (flash?.error) {
            setMessage(flash.error);
            setType('error');
            setVisible(true);
        } else if (flash?.warning) {
            setMessage(flash.warning);
            setType('warning');
            setVisible(true);
        }

        // Esconde o Toast automaticamente após 3.5 segundos
        if (flash?.success || flash?.error || flash?.warning) {
            const timer = setTimeout(() => setVisible(false), 3500);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Ocultar com animação descendo (translate-y)
    const visibilityClasses = visible 
        ? 'translate-y-0 opacity-100' 
        : 'translate-y-10 opacity-0 pointer-events-none';

    return (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center p-4 space-x-3 w-full max-w-sm text-gray-600 bg-white rounded-xl shadow-2xl dark:text-gray-300 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all duration-300 ease-in-out transform ${visibilityClasses}`}>
            
            {/* Ícones consoante o tipo */}
            {type === 'success' && (
                <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-900/40 dark:text-green-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/></svg>
                </div>
            )}
            
            {type === 'error' && (
                <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-900/40 dark:text-red-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/></svg>
                </div>
            )}

            {type === 'warning' && (
                <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-yellow-500 bg-yellow-100 rounded-lg dark:bg-yellow-900/40 dark:text-yellow-400">
                    <span className="font-bold text-lg">!</span>
                </div>
            )}

            <div className="ms-3 text-sm font-bold flex-1">{message}</div>
            
            <button type="button" onClick={() => setVisible(false)} className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700">
                <span className="sr-only">Fechar</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
            </button>
        </div>
    );
}