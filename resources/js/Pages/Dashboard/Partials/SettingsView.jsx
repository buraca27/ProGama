import React from "react";
import PlaceholderView from "./PlaceholderView";

export default function SettingsView() {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Definições do Sistema
                </h3>
                <PlaceholderView title="Configurações Avançadas" icon="⚙️" />
            </div>
        </div>
    );
}
