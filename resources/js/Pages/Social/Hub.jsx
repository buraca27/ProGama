import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

function UserCard({ user, isFollowing, requestSent, requestReceived }) {
    const seguir = () => router.post(route("social.seguir", user.id));
    const aceitar = () => router.post(route("social.aceitar", user.id));
    const recusar = () => router.post(route("social.recusar", user.id));
    const deixar = () => router.delete(route("social.deixar-seguir", user.id));

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-base font-bold text-slate-900 dark:text-white">
                {user.name}
            </p>
            <p className="mt-1 text-sm text-slate-500">
                Nível {user.nivel} • {user.xp_total} XP
            </p>
            <p className="text-xs text-slate-500">
                {user.badges_count} distintivos • {user.seguidores_count}{" "}
                seguidores
            </p>

            <div className="mt-3 flex items-center justify-between">
                <Link
                    href={route("perfil.publico", user.id)}
                    className="text-sm font-semibold text-blue-600 hover:underline"
                >
                    Ver perfil
                </Link>

                {isFollowing ? (
                    <button
                        onClick={deixar}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold dark:border-slate-600"
                    >
                        Não seguir
                    </button>
                ) : requestReceived ? (
                    <div className="flex gap-2">
                        <button
                            onClick={aceitar}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                            Aceitar
                        </button>
                        <button
                            onClick={recusar}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold dark:border-slate-600"
                        >
                            Recusar
                        </button>
                    </div>
                ) : requestSent ? (
                    <button
                        disabled
                        className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                    >
                        Pedido enviado
                    </button>
                ) : (
                    <button
                        onClick={seguir}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
                    >
                        Enviar pedido
                    </button>
                )}
            </div>
        </div>
    );
}

export default function Hub({
    sugestoes = [],
    seguindo = [],
    social_stats = {},
}) {
    return (
        <AuthenticatedLayout>
            <Head title="Rede Social" />

            <div className="space-y-6">
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
                    <Link
                        href={route("dashboard", { view: "leaderboard" })}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
                    >
                        Ver Ranking
                    </Link>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
                        <p className="text-xs text-slate-500">Seguidores</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {social_stats.seguidores ?? 0}
                        </p>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
                        <p className="text-xs text-slate-500">Seguindo</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {social_stats.seguindo ?? 0}
                        </p>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
                        <p className="text-xs text-slate-500">
                            Conexoes Mutuas
                        </p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {social_stats.conexoes ?? 0}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section>
                        <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
                            Sugestoes para seguir
                        </h2>
                        <div className="space-y-3">
                            {sugestoes.map((user) => (
                                <UserCard
                                    key={`s-${user.id}`}
                                    user={user}
                                    isFollowing={false}
                                    requestSent={user.request_sent}
                                    requestReceived={user.request_received}
                                />
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
                            A quem segues
                        </h2>
                        <div className="space-y-3">
                            {seguindo.map((user) => (
                                <UserCard
                                    key={`f-${user.id}`}
                                    user={user}
                                    isFollowing
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
