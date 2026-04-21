import React, { useRef } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { compressImageToBase64 } from "@/utils";
import { router } from "@inertiajs/react";

export default function CreateUserForm({ onSuccess }) {
    const fileInputRef = useRef(null);
    // Recupera o auth via usePage para evitar erros de undefined
    const { auth } = usePage().props;

    // 1. Lógica de Gerar Password Forte
    const gerarPassword = () => {
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const nums = "0123456789";
        const syms = "!@#$%";
        const rand = (str) => str[Math.floor(Math.random() * str.length)];
        const base = [
            rand(upper),
            rand(upper),
            rand(lower),
            rand(lower),
            rand(nums),
            rand(nums),
            rand(nums),
            rand(syms),
        ];
        return (
            base.sort(() => Math.random() - 0.5).join("") +
            rand(nums) +
            rand(upper)
        );
    };

    const { data, setData, post, processing, reset, transform, errors } =
        useForm({
            name: "", // Usado para Aluno
            firstName: "", // Usado para Staff
            lastName: "", // Usado para Staff
            numero_interno: "",
            ano_entrada: new Date().getFullYear().toString(),
            role: "aluno",
            password: gerarPassword(),
            email_pessoal: "",
            foto_perfil: "",
        });

    // 2. Lógica de Geração de Email Dinâmico
    const getEmailGerado = () => {
        const clean = (str) =>
            str
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

        if (data.role === "professor" || data.role === "secretaria") {
            if (!data.firstName || !data.lastName) return "A aguardar nomes...";

            const fName = clean(data.firstName);
            const lName = clean(data.lastName);
            const sufixo = data.role === "professor" ? ".professor" : "";

            return `${fName}.${lName}${sufixo}@progama.pt`;
        }

        if (!data.numero_interno || !data.ano_entrada)
            return "A aguardar dados do aluno...";
        return `${data.numero_interno}${data.ano_entrada}.alunos@progama.pt`.toLowerCase();
    };

    // 3. Compressão de Imagem
    const handleFotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            compressImageToBase64(file, (base64String) => {
                setData("foto_perfil", base64String);
            });
        }
    };

    const submit = (e) => {
        e.preventDefault();

        // 1. Geramos o email antes de tudo
        const emailFinal = getEmailGerado();

        // 2. Usamos o transform para injetar os dados dinâmicos antes de enviar
        transform((data) => ({
            ...data,
            email: emailFinal,
            name:
                data.role === "aluno"
                    ? data.name
                    : `${data.firstName} ${data.lastName}`,
        }));

        // 3. Usamos o post que vem do useForm (NÃO o router.post)
        post(route("utilizadores.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onSuccess();
                alert("Conta institucional criada com sucesso!");
            },
        });
    };
    return (
        <form
            onSubmit={submit}
            className="mb-8 bg-blue-50/50 dark:bg-gray-700/50 border border-blue-100 dark:border-gray-600 p-6 rounded-xl transition-all"
        >
            <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                🚀 Nova Conta Institucional
            </h4>

            {/* FOTO UPLOAD */}
            <div className="mb-6 flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 w-fit">
                <div
                    onClick={() => fileInputRef.current.click()}
                    className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
                >
                    {data.foto_perfil ? (
                        <img
                            src={data.foto_perfil}
                            className="w-full h-full object-cover"
                            alt="Preview"
                        />
                    ) : (
                        <span className="text-2xl opacity-50">📷</span>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFotoUpload}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="text-sm font-bold text-blue-600 hover:underline"
                >
                    {data.foto_perfil ? "Alterar Foto" : "Definir Foto"}
                </button>
            </div>

            {/* INPUTS DE IDENTIDADE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {data.role === "aluno" ? (
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Nome Completo do Aluno
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                            className="w-full rounded-md border-gray-300 dark:bg-gray-800 dark:text-white focus:ring-blue-500"
                            placeholder="Ex: João Silva"
                        />
                    </div>
                ) : (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                Primeiro Nome
                            </label>
                            <input
                                type="text"
                                value={data.firstName}
                                onChange={(e) =>
                                    setData("firstName", e.target.value)
                                }
                                required
                                className="w-full rounded-md border-gray-300 dark:bg-gray-800 dark:text-white focus:ring-blue-500"
                                placeholder="Ex: Rui"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                Apelido
                            </label>
                            <input
                                type="text"
                                value={data.lastName}
                                onChange={(e) =>
                                    setData("lastName", e.target.value)
                                }
                                required
                                className="w-full rounded-md border-gray-300 dark:bg-gray-800 dark:text-white focus:ring-blue-500"
                                placeholder="Ex: Santos"
                            />
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Tipo de Conta
                    </label>
                    <select
                        value={data.role}
                        onChange={(e) => setData("role", e.target.value)}
                        className="w-full rounded-md border-gray-300 dark:bg-gray-800 dark:text-white focus:ring-blue-500"
                    >
                        <option value="aluno">Aluno</option>
                        <option value="professor">Professor</option>
                        <option value="secretaria">Secretaria</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Email Pessoal
                    </label>
                    <input
                        type="email"
                        value={data.email_pessoal}
                        onChange={(e) =>
                            setData("email_pessoal", e.target.value)
                        }
                        className="w-full rounded-md border-gray-300 dark:bg-gray-800 dark:text-white focus:ring-blue-500"
                        placeholder="Ex: user@gmail.com"
                    />
                </div>
            </div>

            {/* CAMPOS ESPECÍFICOS DO ALUNO */}
            {data.role === "aluno" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-2 border-t border-blue-100 dark:border-gray-600">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Nº Processo Interno
                        </label>
                        <input
                            type="text"
                            value={data.numero_interno}
                            onChange={(e) =>
                                setData("numero_interno", e.target.value)
                            }
                            required
                            className="w-full rounded-md border-gray-300 dark:bg-gray-800 dark:text-white"
                            placeholder="Ex: 12345"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Ano de Entrada
                        </label>
                        <input
                            type="text"
                            value={data.ano_entrada}
                            onChange={(e) =>
                                setData("ano_entrada", e.target.value)
                            }
                            required
                            className="w-full rounded-md border-gray-300 dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                </div>
            )}

            {/* FOOTER: GERAÇÃO EM TEMPO REAL */}
            <div className="flex flex-col md:flex-row items-stretch justify-between bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 mt-6 shadow-sm gap-6">
                <div className="flex-1 space-y-4">
                    <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Endereço Institucional a Criar
                        </span>
                        <div className="text-xl font-black text-blue-600 dark:text-blue-400 break-all">
                            {getEmailGerado()}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded border border-yellow-200 dark:border-yellow-800">
                            <span className="text-[10px] font-bold text-yellow-700 dark:text-yellow-500 uppercase block">
                                Password Provisória
                            </span>
                            <code className="text-sm font-mono font-bold text-gray-800 dark:text-gray-200">
                                {data.password}
                            </code>
                        </div>
                        <button
                            type="button"
                            onClick={() => setData("password", gerarPassword())}
                            className="text-xs text-blue-600 font-bold hover:text-blue-800"
                        >
                            🔄 Gerar Outra
                        </button>
                    </div>
                </div>

                <div className="flex items-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                    >
                        {processing ? "A processar..." : "Criar Utilizador"}
                    </button>
                </div>
            </div>

            {/* Mensagens de Erro Globais */}
            {Object.keys(errors).length > 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 text-xs">
                    Verifica os dados introduzidos:{" "}
                    {Object.values(errors).join(", ")}
                </div>
            )}
        </form>
    );
}
