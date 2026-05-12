import { useEffect, useState } from 'react';

export default function UpdateThemeForm({ className = '' }) {
    // 1. Atualizamos a forma como o tema inicial é calculado
    const [theme, setTheme] = useState(() => {
        // Se já existir uma preferência gravada, usamos essa
        if (localStorage.getItem('theme')) {
            return localStorage.getItem('theme');
        }
        // Se não existir, verificamos se o Windows/Mac do utilizador está em Dark Mode
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        // Caso contrário, fallback para dark
        return 'dark';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tema da Aplicação</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Alterne entre o tema claro e escuro de acordo com a sua preferência.
                </p>
            </header>

            <div className="mt-6">
                <button
                    onClick={toggleTheme}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
                >
                    {theme === 'light' ? 'Mudar para Modo Escuro 🌙' : 'Mudar para Modo Claro ☀️'}
                </button>
            </div>
        </section>
    );
}