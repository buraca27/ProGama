import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

function UserCard({ user, isFollowing }) {
    const seguir = () => router.post(route("social.seguir", user.id));
    const deixar = () => router.delete(route("social.deixar-seguir", user.id));

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-base font-bold text-slate-900 dark:text-white">{user.name}</p>
            <p className="mt-1 text-sm text-slate-500">Nivel {user.nivel} • {user.xp_total} XP</p>
            <p className="text-xs text-slate-500">{user.badges_count} badges • {user.seguidores_count} seguidores</p>

            <div className="mt-3 flex items-center justify-between">
                <Link href={route("perfil.publico", user.id)} className="text-sm font-semibold text-blue-600 hover:underline">
                    Ver perfil
                </Link>

                {isFollowing ? (
                    <button onClick={deixar} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold dark:border-slate-600">
                        Deixar
                    </button>
                ) : (
                    <button onClick={seguir} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                        Seguir
                    </button>
                )}
            </div>
        </div>
    );
}

export default function Hub({ sugestoes = [], seguindo = [], social_stats = {} }) {
    return (
        <AuthenticatedLayout>
            <Head title="Social" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Rede Social</h1>
                        <p className="text-sm text-slate-500">Segue colegas, cria conexoes e acompanha niveis e badges.</p>
                    </div>
                    <Link href={route("dashboard")} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                        Ver Leaderboard
                    </Link>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
                        <p className="text-xs text-slate-500">Seguidores</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{social_stats.seguidores ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
                        <p className="text-xs text-slate-500">Seguindo</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{social_stats.seguindo ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
                        <p className="text-xs text-slate-500">Conexoes Mutuas</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{social_stats.conexoes ?? 0}</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section>
                        <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Sugestoes para seguir</h2>
                        <div className="space-y-3">
                            {sugestoes.map((user) => (
                                <UserCard key={`s-${user.id}`} user={user} isFollowing={false} />
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">A quem segues</h2>
                        <div className="space-y-3">
                            {seguindo.map((user) => (
                                <UserCard key={`f-${user.id}`} user={user} isFollowing />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
