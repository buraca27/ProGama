import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";

// Importações do Perfil
import UpdateProfileInformationForm from "@/Pages/Profile/Partials/UpdateProfileInformationForm";
import UpdatePasswordForm from "@/Pages/Profile/Partials/UpdatePasswordForm";
import DeleteUserForm from "@/Pages/Profile/Partials/DeleteUserForm";
import UpdateThemeForm from "@/Pages/Profile/Partials/UpdateThemeForm"; // <-- Importação adicionada aqui!

export default function Dashboard({
    auth,
    userRoleReal,
    estatisticas,
    utilizadores,
}) {
    const userRole = userRoleReal || "admin";
    const [activeView, setActiveView] = useState("dashboard");

    // Estado para controlar se o formulário de criação está aberto ou fechado
    const [showNovoUserForm, setShowNovoUserForm] = useState(false);

    // Lógica do Formulário da Secretaria usando Inertia
    const gerarPassword = () => {
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const nums = "0123456789";
        const syms = "!@#$%";
        const rand = (str) => str[Math.floor(Math.random() * str.length)];
        const base = [
            rand(upper), rand(upper), rand(lower), rand(lower),
            rand(nums), rand(nums), rand(nums), rand(syms),
        ];
        return base.sort(() => Math.random() - 0.5).join("") + rand(nums) + rand(upper);
    };

    const { data, setData, post, processing, reset, transform, errors } =
        useForm({
            name: "",
            numero_interno: "",
            ano_entrada: new Date().getFullYear().toString(),
            role: "aluno",
            password: gerarPassword(),
            email_pessoal: "",
        });

    const getEmailGerado = () => {
        if (data.role === "professor" || data.role === "secretaria") {
            if (!data.name || data.name.trim().split(" ").length < 2) return "Aguarda nome completo...";
            const partes = data.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(" ").filter((p) => p.length > 0);
            const primeiro = partes[0];
            const ultimo = partes[partes.length - 1];
            const sufixo = data.role === "professor" ? ".professor" : "";
            return `${primeiro}.${ultimo}${sufixo}@progama.pt`;
        }
        if (!data.numero_interno || !data.ano_entrada) return "A aguardar dados...";
        return `${data.numero_interno}${data.ano_entrada}.alunos@progama.pt`.toLowerCase();
    };

    const submitNovoUtilizador = (e) => {
        e.preventDefault();
        transform((currentData) => ({
            ...currentData,
            email: getEmailGerado(),
        }));
        post(route("utilizadores.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowNovoUserForm(false);
                alert("Conta institucional criada com sucesso!");
            },
        });
    };

    const renderContent = () => {
        // ==========================================
        // VISTA PRINCIPAL
        // ==========================================
        if (activeView === "dashboard") {
            return (
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
                        <div className="p-6 text-gray-900 dark:text-gray-100 text-lg flex items-center justify-between">
                            <span>
                                Olá, <strong>{auth.user.name}</strong>! Eis o que se passa na tua conta hoje.
                            </span>
                        </div>
                    </div>

                    {userRole === "admin" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <DashboardCard
                                title="Total de Utilizadores"
                                value={estatisticas?.total_users || 0}
                                sub="Contas criadas"
                                color="text-blue-600 dark:text-blue-400"
                            />
                            <DashboardCard
                                title="Turmas Ativas"
                                value={estatisticas?.total_turmas || 0}
                                sub="Registadas no sistema"
                                color="text-green-600 dark:text-green-400"
                            />
                            <DashboardCard
                                title="Sistema"
                                value="Online"
                                sub="Tudo operacional"
                                color="text-emerald-600 dark:text-emerald-400"
                            />
                        </div>
                    )}
                </div>
            );
        }

        // ==========================================
        // VISTAS DA SECRETARIA (ADMIN)
        // ==========================================
        if (activeView === "utilizadores") {
            return (
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                Gestão de Utilizadores
                            </h3>
                            <button
                                onClick={() => setShowNovoUserForm(!showNovoUserForm)}
                                className={`${showNovoUserForm ? "bg-gray-500 hover:bg-gray-600" : "bg-blue-600 hover:bg-blue-700"} text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors`}
                            >
                                {showNovoUserForm ? "Cancelar e Fechar" : "+ Nova Conta Institucional"}
                            </button>
                        </div>

                        {showNovoUserForm && (
                            <form
                                onSubmit={submitNovoUtilizador}
                                className="mb-8 bg-blue-50/50 dark:bg-gray-700/50 border border-blue-100 dark:border-gray-600 p-6 rounded-xl transition-colors"
                            >
                                <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                                    <span>🏫</span> Criar Credenciais Institucionais
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Nome Completo
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData("name", e.target.value)}
                                            required
                                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors"
                                            placeholder="Ex: Rui Santos"
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Tipo de Conta
                                        </label>
                                        <select
                                            value={data.role}
                                            onChange={(e) => setData("role", e.target.value)}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors"
                                        >
                                            <option value="aluno">Aluno / Estudante</option>
                                            <option value="professor">Professor / Docente</option>
                                            <option value="secretaria">Secretaria / Admin</option>
                                        </select>
                                    </div>

                                    {data.role === "aluno" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Nº Processo / ID
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.numero_interno}
                                                    onChange={(e) => setData("numero_interno", e.target.value)}
                                                    required
                                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors"
                                                    placeholder="Ex: 1542"
                                                />
                                                {errors.numero_interno && <p className="text-red-500 text-xs mt-1">{errors.numero_interno}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Ano Entrada
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.ano_entrada}
                                                    onChange={(e) => setData("ano_entrada", e.target.value)}
                                                    required
                                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors"
                                                    placeholder="Ex: 2026"
                                                />
                                                {errors.ano_entrada && <p className="text-red-500 text-xs mt-1">{errors.ano_entrada}</p>}
                                            </div>
                                        </>
                                    )}

                                    <div className={data.role === "aluno" ? "lg:col-span-4" : "lg:col-span-2"}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Email Pessoal <span className="text-gray-400 dark:text-gray-500 font-normal">(para envio de credenciais)</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email_pessoal}
                                            onChange={(e) => setData("email_pessoal", e.target.value)}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors"
                                            placeholder="Ex: rui.santos@gmail.com"
                                        />
                                        {errors.email_pessoal && <p className="text-red-500 text-xs mt-1">{errors.email_pessoal}</p>}
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-stretch justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 mt-4 shadow-sm gap-4 transition-colors">
                                    <div className="flex flex-col gap-3 flex-1">
                                        <div>
                                            <span className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                                                Email Institucional Gerado
                                            </span>
                                            <div className="text-lg font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                                                {getEmailGerado()}
                                            </div>
                                        </div>

                                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700/50 rounded-lg flex items-center justify-between gap-3 transition-colors">
                                            <div>
                                                <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium mb-1">
                                                    🔑 Password provisória:
                                                </p>
                                                <code className="text-sm font-mono font-bold text-yellow-900 dark:text-yellow-300 tracking-wider">
                                                    {data.password}
                                                </code>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setData("password", gerarPassword())}
                                                className="text-xs bg-yellow-200 dark:bg-yellow-800 hover:bg-yellow-300 dark:hover:bg-yellow-700 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded whitespace-nowrap transition-colors"
                                            >
                                                🔄 Gerar nova
                                            </button>
                                        </div>

                                        {data.email_pessoal ? (
                                            <p className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 rounded px-3 py-2 transition-colors">
                                                ✅ As credenciais serão enviadas para <strong>{data.email_pessoal}</strong>
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-400 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 transition-colors">
                                                ⚠️ Sem email pessoal — as credenciais não serão enviadas por email.
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full md:w-auto self-end bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
                                    >
                                        {processing ? "A criar..." : "Criar Utilizador"}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="overflow-x-auto mt-4">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50 transition-colors">
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">ID</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Nome</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Email Institucional</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Data Criação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {utilizadores && utilizadores.map((u) => (
                                        <tr key={u.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">#{u.id}</td>
                                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-200">{u.name}</td>
                                            <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">{u.email}</td>
                                            <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">
                                                {new Date(u.created_at).toLocaleDateString("pt-PT")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        }

        // ==========================================
        // VISTA DO PERFIL
        // ==========================================
        if (activeView === "perfil") {
            return (
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
                        <UpdateThemeForm className="max-w-xl" />
                    </div>
                    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
                        <UpdateProfileInformationForm className="max-w-xl" />
                    </div>
                    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>
                </div>
            );
        }

        // Vistas vazias / Restantes
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 border-dashed transition-colors">
                <span className="text-4xl mb-4">🚧</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Em Construção
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Esta funcionalidade será adicionada em breve.
                </p>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            activeView={activeView}
            onViewChange={setActiveView}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight transition-colors">
                    ProGama Workspace
                </h2>
            }
        >
            <Head title="Dashboard" />
            {renderContent()}
        </AuthenticatedLayout>
    );
}

function DashboardCard({ title, value, sub, color }) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-all duration-200">
            <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {title}
                </h3>
                <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
            </div>
            <div className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">{sub}</div>
        </div>
    );
}