import React from "react";

export default function SearchBar({ value, onChange, placeholder, onClear }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-300 dark:border-gray-600 flex items-center gap-3 px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <svg
                className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
            </svg>
            <input
                type="text"
                placeholder={placeholder || "Pesquisar..."}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
            />
            {value && (
                <button
                    onClick={onClear}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0 font-bold"
                >
                    ✖
                </button>
            )}
        </div>
    );
}
