<<<<<<< HEAD
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
=======
import ApplicationLogo from "@/Components/ApplicationLogo";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";

export default function AuthenticatedLayout({
    header,
    children,
    activeView,
    onViewChange,
}) {
    const user = usePage().props.auth.user;
    const userRole = usePage().props.userRoleReal || "admin";

    const MenuButton = ({ id, label }) => (
        <button
            onClick={() => onViewChange && onViewChange(id)}
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm ${
                activeView === id
                    ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-200">
            {/* --- BARRA LATERAL ESQUERDA --- */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between hidden md:flex shadow-sm z-20 transition-colors duration-200">
                <div>
                    <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-700">
                        <Link href="/">
                            <ApplicationLogo className="block h-8 w-auto fill-current text-blue-600 dark:text-blue-400" />
                        </Link>
                        <span className="ml-3 font-extrabold text-xl text-gray-900 dark:text-gray-100 tracking-tight">
                            ProGama
                        </span>
                    </div>

                    <nav className="mt-6 px-4 space-y-1">
                        <MenuButton
                            id="dashboard"
                            label="Dashboard Principal"
                        />

                        {/* MENUS ESPECÍFICOS PARA ADMIN */}
                        {userRole === "admin" && (
                            <>
                                <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                    Administração
                                </div>
                                <MenuButton
                                    id="utilizadores"
                                    label="Gerir Utilizadores"
                                />
                                <MenuButton
                                    id="turmas"
                                    label="Gestão de Turmas"
                                />
                                <MenuButton
                                    id="definicoes"
                                    label="Definições do Sistema"
                                />
                            </>
                        )}

                        {/* MENUS ESPECÍFICOS PARA PROFESSOR */}
                        {userRole === "professor" && (
                            <>
                                <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                    Área de Ensino
                                </div>
                                <MenuButton
                                    id="minhas-turmas"
                                    label="As Minhas Turmas"
                                />
                                <MenuButton
                                    id="tarefas"
                                    label="Atribuir Tarefas"
                                />
                                <MenuButton
                                    id="avaliacoes"
                                    label="Avaliações e Notas"
                                />
                            </>
                        )}

                        {/* MENUS ESPECÍFICOS PARA ALUNO */}
                        {userRole === "aluno" && (
                            <>
                                <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                    Área do Aluno
                                </div>
                                <MenuButton
                                    id="disciplinas"
                                    label="As Minhas Disciplinas"
                                />
                                <MenuButton
                                    id="trabalhos"
                                    label="Trabalhos Pendentes"
                                />
                                <MenuButton
                                    id="boletim"
                                    label="Boletim de Notas"
                                />
                            </>
                        )}
                    </nav>
                </div>
                
                {/* Perfil e Logout */}
                <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800">
                    <div className="mb-3 px-3">
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {user.name}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mt-1">
                            {userRole}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <button
                            onClick={() =>
                                onViewChange && onViewChange("perfil")
                            }
                            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeView === "perfil"
                                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700"
                            }`}
                        >
                            Meu Perfil
                        </button>

                        <ResponsiveNavLink
                            method="post"
                            href={route("logout")}
                            as="button"
                            className="rounded-lg text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 focus:bg-red-50 dark:focus:bg-red-900/30"
                        >
                            Terminar Sessão
                        </ResponsiveNavLink>
                    </div>
                </div>
            </aside>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {header && (
                    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 z-10 transition-colors duration-200">
                        <div className="px-8 py-5">{header}</div>
                    </header>
                )}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-200">
                    {children}
                </main>
            </div>
        </div>
    );
}
>>>>>>> origin/team-b/rafael-oliveira
