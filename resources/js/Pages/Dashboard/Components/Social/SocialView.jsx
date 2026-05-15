import { useState, useEffect, useRef, useCallback } from "react";
import { router } from "@inertiajs/react";

const ROLE_LABEL = { 1: "Secretaria", 2: "Professor", 3: "Aluno" };
const ROLE_COLOR = {
    1: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    2: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    3: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

function RoleBadge({ idRole }) {
    return (
        <span
            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ROLE_COLOR[idRole] ?? ROLE_COLOR[3]}`}
        >
            {ROLE_LABEL[idRole] ?? "Aluno"}
        </span>
    );
}

function Avatar({ user, size = "sm" }) {
    const dim = size === "lg" ? "h-12 w-12 text-lg" : "h-9 w-9 text-sm";
    return (
        <div
            className={`${dim} shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center`}
        >
            {user.foto_perfil ? (
                <img
                    src={user.foto_perfil}
                    alt={user.name}
                    className="h-full w-full object-cover"
                />
            ) : (
                <span className="font-bold text-slate-600 dark:text-slate-200">
                    {user.name?.charAt(0) ?? "?"}
                </span>
            )}
        </div>
    );
}

function PedidoCard({ user, onOpenPerfil, onCloseModal }) {
    const aceitar = () =>
        router.post(
            route("social.aceitar", user.id),
            {},
            { preserveState: true, onSuccess: () => onCloseModal?.() },
        );
    const recusar = () =>
        router.post(
            route("social.recusar", user.id),
            {},
            { preserveState: true, onSuccess: () => onCloseModal?.() },
        );
    const isAluno = user.id_role === 3;

    return (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <Avatar user={user} size="lg" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                        {user.name}
                    </p>
                    <RoleBadge idRole={user.id_role} />
                </div>
                {isAluno && (
                    <p className="text-xs text-slate-500">
                        Nível {user.nivel} • {user.xp_total} XP •{" "}
                        {user.badges_count} badges
                    </p>
                )}
                <button
                    onClick={() => onOpenPerfil?.(user.id)}
                    className="mt-0.5 text-xs font-semibold text-blue-600 hover:underline"
                >
                    Ver perfil
                </button>
            </div>
            <div className="flex shrink-0 gap-2">
                <button
                    onClick={aceitar}
                    className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                    Aceitar
                </button>
                <button
                    onClick={recusar}
                    className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    Recusar
                </button>
            </div>
        </div>
    );
}

function UserCard({
    user,
    isFollowing,
    requestSent,
    requestReceived,
    onOpenPerfil,
}) {
    const seguir = () =>
        router.post(
            route("social.seguir", user.id),
            {},
            { preserveState: true },
        );
    const aceitar = () =>
        router.post(
            route("social.aceitar", user.id),
            {},
            { preserveState: true },
        );
    const recusar = () =>
        router.post(
            route("social.recusar", user.id),
            {},
            { preserveState: true },
        );
    const deixar = () =>
        router.delete(route("social.deixar-seguir", user.id), {
            preserveState: true,
        });
    const isAluno = user.id_role === 3;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start gap-3">
                <Avatar user={user} size="lg" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                            {user.name}
                        </p>
                        <RoleBadge idRole={user.id_role} />
                    </div>
                    {isAluno ? (
                        <>
                            <p className="text-xs text-slate-500">
                                Nível {user.nivel} • {user.xp_total} XP
                            </p>
                            <p className="text-xs text-slate-500">
                                {user.badges_count} badges •{" "}
                                {user.seguidores_count} seguidores
                            </p>
                        </>
                    ) : (
                        <p className="text-xs text-slate-500">
                            {user.seguidores_count} seguidores
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
                <button
                    onClick={() => onOpenPerfil?.(user.id)}
                    className="text-sm font-semibold text-blue-600 hover:underline"
                >
                    Ver perfil
                </button>

                {isFollowing ? (
                    <button
                        onClick={deixar}
                        className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        Não seguir
                    </button>
                ) : requestReceived ? (
                    <div className="flex gap-2">
                        <button
                            onClick={aceitar}
                            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                            Aceitar
                        </button>
                        <button
                            onClick={recusar}
                            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold dark:border-slate-600"
                        >
                            Recusar
                        </button>
                    </div>
                ) : requestSent ? (
                    <button
                        disabled
                        className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                    >
                        Pedido enviado
                    </button>
                ) : (
                    <button
                        onClick={seguir}
                        className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
                    >
                        Enviar pedido
                    </button>
                )}
            </div>
        </div>
    );
}

function SeguidorCard({ user, onOpenPerfil }) {
    const remover = () =>
        router.delete(route("social.remover-seguidor", user.id), {
            preserveState: true,
        });
    const seguir = () =>
        router.post(
            route("social.seguir", user.id),
            {},
            { preserveState: true },
        );
    const isAluno = user.id_role === 3;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start gap-3">
                <Avatar user={user} size="lg" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                            {user.name}
                        </p>
                        <RoleBadge idRole={user.id_role} />
                    </div>
                    {isAluno ? (
                        <>
                            <p className="text-xs text-slate-500">
                                Nível {user.nivel} • {user.xp_total} XP
                            </p>
                            <p className="text-xs text-slate-500">
                                {user.badges_count} badges •{" "}
                                {user.seguidores_count} seguidores
                            </p>
                        </>
                    ) : (
                        <p className="text-xs text-slate-500">
                            {user.seguidores_count} seguidores
                        </p>
                    )}
                </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
                <button
                    onClick={() => onOpenPerfil?.(user.id)}
                    className="text-sm font-semibold text-blue-600 hover:underline"
                >
                    Ver perfil
                </button>
                <div className="flex gap-2">
                    {!user.is_following && (
                        <button
                            onClick={seguir}
                            className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
                        >
                            Seguir de volta
                        </button>
                    )}
                    <button
                        onClick={remover}
                        className="rounded-xl border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                        Remover
                    </button>
                </div>
            </div>
        </div>
    );
}

const FILTROS = [
    { key: "", label: "Todos" },
    { key: "alunos", label: "Alunos" },
    { key: "professores", label: "Professores" },
    { key: "secretaria", label: "Secretaria" },
    { key: "turma", label: "Minha Turma" },
];

export default function SocialView({
    sugestoes = [],
    seguindo = [],
    seguidores = [],
    pedidosPendentes = [],
    social_stats = {},
    isSearching = false,
    active_filter = "",
    onViewChange,
    onOpenPerfil,
    onCloseModal,
}) {
    const [pesquisa, setPesquisa] = useState("");
    const [filtro, setFiltro] = useState(active_filter ?? "");
    const [searchLoading, setSearchLoading] = useState(false);
    const isMounted = useRef(false);

    const reloadSocial = useCallback((data = {}) => {
        return new Promise((resolve) => {
            router.reload({
                only: ["socialData"],
                replace: true,
                data,
                onSuccess: () => {
                    window.history.replaceState(null, "", "/dashboard");
                    resolve();
                },
                onError: resolve,
            });
        });
    }, []);

    const buildParams = useCallback(
        (overrides = {}) => {
            const params = {};
            const search =
                overrides.pesquisa !== undefined
                    ? overrides.pesquisa
                    : pesquisa;
            const filter =
                overrides.filtro !== undefined ? overrides.filtro : filtro;
            if (search.trim()) params.social_search = search.trim();
            if (filter) params.social_filter = filter;
            return params;
        },
        [pesquisa, filtro],
    );

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        const timer = setTimeout(() => {
            setSearchLoading(true);
            reloadSocial(buildParams()).then(() => setSearchLoading(false));
        }, 600);
        return () => clearTimeout(timer);
    }, [pesquisa, reloadSocial, buildParams]);

    const handleFiltro = (key) => {
        setFiltro(key);
        setSearchLoading(true);
        reloadSocial(buildParams({ filtro: key })).then(() =>
            setSearchLoading(false),
        );
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (pesquisa.trim() === "") reloadSocial(buildParams());
        }, 30000);
        return () => clearInterval(interval);
    }, [pesquisa, filtro, reloadSocial, buildParams]);

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                        Rede Social
                    </h1>
                    <p className="text-sm text-slate-500">
                        Segue colegas, cria conexões e acompanha níveis e
                        distintivos.
                    </p>
                </div>
                <button
                    onClick={() => onViewChange?.("leaderboard")}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
                >
                    Ver Ranking
                </button>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
                {FILTROS.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => handleFiltro(f.key)}
                        className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors ${
                            filtro === f.key
                                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
                {searchLoading && (
                    <div className="ml-2 flex items-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
                    <p className="text-xs text-slate-500">Seguidores</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {social_stats.seguidores ?? 0}
                    </p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
                    <p className="text-xs text-slate-500">Seguindo</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {social_stats.seguindo ?? 0}
                    </p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
                    <p className="text-xs text-slate-500">Conexões Mútuas</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {social_stats.conexoes ?? 0}
                    </p>
                </div>
            </div>

            {/* Pedidos Pendentes */}
            {pedidosPendentes.length > 0 && (
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Pedidos Pendentes
                        </h2>
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-bold text-white">
                            {pedidosPendentes.length}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {pedidosPendentes.map((user) => (
                            <PedidoCard
                                key={`p-${user.id}`}
                                user={user}
                                onOpenPerfil={onOpenPerfil}
                                onCloseModal={onCloseModal}
                            />
                        ))}
                    </div>
                </section>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Sugestões / Pesquisa */}
                <section>
                    <div className="mb-3">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            {isSearching
                                ? "Resultados da pesquisa"
                                : "Sugestões para seguir"}
                        </h2>
                    </div>

                    <div className="mb-3">
                        <input
                            type="text"
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                            placeholder="Pesquisar utilizadores..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                        />
                    </div>

                    <div className="space-y-3">
                        {sugestoes.length === 0 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {isSearching
                                    ? "Nenhum utilizador encontrado."
                                    : "Sem sugestões de momento."}
                            </p>
                        )}
                        {sugestoes.map((user) => (
                            <UserCard
                                key={`s-${user.id}`}
                                user={user}
                                isFollowing={user.is_following ?? false}
                                requestSent={user.request_sent}
                                requestReceived={user.request_received}
                                onOpenPerfil={onOpenPerfil}
                            />
                        ))}
                    </div>
                </section>

                {/* A quem segues */}
                <section>
                    <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
                        A quem segues ({seguindo.length})
                    </h2>
                    <div className="space-y-3">
                        {seguindo.length === 0 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Ainda não segues ninguém.
                            </p>
                        )}
                        {seguindo.map((user) => (
                            <UserCard
                                key={`f-${user.id}`}
                                user={user}
                                isFollowing
                                onOpenPerfil={onOpenPerfil}
                            />
                        ))}
                    </div>
                </section>

                {/* Meus Seguidores */}
                <section>
                    <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
                        Meus Seguidores ({seguidores.length})
                    </h2>
                    <div className="space-y-3">
                        {seguidores.length === 0 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 col-span-full">
                                Ainda não tens seguidores.
                            </p>
                        )}
                        {seguidores.map((user) => (
                            <SeguidorCard
                                key={`seg-${user.id}`}
                                user={user}
                                onOpenPerfil={onOpenPerfil}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
