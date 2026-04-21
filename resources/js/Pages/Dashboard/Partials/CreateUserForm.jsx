// resources/js/Pages/Dashboard/Partials/CreateUserForm.jsx
import React, { useRef } from "react";
import { useForm } from "@inertiajs/react";
import { compressImageToBase64 } from "@/utils";

export default function CreateUserForm({ onSuccess }) {
    const fileInputRef = useRef(null);

    const gerarPassword = () => {
        const str =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        return Array.from(
            { length: 10 },
            () => str[Math.floor(Math.random() * str.length)],
        ).join("");
    };

    const { data, setData, post, processing, reset, errors } = useForm({
        name: "",
        numero_interno: "",
        role: "aluno",
        password: gerarPassword(),
        email_pessoal: "",
        foto_perfil: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("utilizadores.store"), {
            onSuccess: () => {
                reset();
                onSuccess();
            },
        });
    };

    return (
        <form
            onSubmit={submit}
            className="mb-8 bg-blue-50/50 dark:bg-gray-700/50 border border-blue-100 dark:border-gray-600 p-6 rounded-xl"
        >
            {/* ... Todo o JSX do teu formulário de criação ... */}
            <button
                type="submit"
                disabled={processing}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold"
            >
                Criar Utilizador
            </button>
        </form>
    );
}
