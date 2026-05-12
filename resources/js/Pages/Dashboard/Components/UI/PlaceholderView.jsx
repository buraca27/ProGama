// resources/js/Pages/Dashboard/Partials/PlaceholderView.jsx
import React from "react";

export default function PlaceholderView({ title, icon = "🚧" }) {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 border-dashed border-gray-200 dark:border-gray-700 transition-all duration-300">
                {/* Círculo de Ícone */}
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-4xl mb-6 animate-pulse">
                    {icon}
                </div>

                {/* Texto Informativo */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                </h3>

                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm px-6">
                    Estamos a trabalhar arduamente nesta funcionalidade. <br />
                    Fica atento às próximas atualizações do{" "}
                    <strong>ProGama</strong>!
                </p>

                {/* Botão de Volta (Opcional) */}
                <div className="mt-8 flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                    <span className="h-2 w-2 rounded-full bg-blue-300"></span>
                    <span className="h-2 w-2 rounded-full bg-blue-200"></span>
                </div>
            </div>
        </div>
    );
}
