import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
<<<<<<< HEAD
import PrimaryButton from '@/Components/PrimaryButton';
=======
>>>>>>> origin/team-b/rafael-oliveira
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
<<<<<<< HEAD
                <h2 className="text-lg font-medium text-gray-900">
                    Update Password
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Ensure your account is using a long, random password to stay
                    secure.
=======
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Atualizar Palavra-passe
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Garanta que a sua conta está a usar uma palavra-passe longa e aleatória para se manter segura.
>>>>>>> origin/team-b/rafael-oliveira
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel
                        htmlFor="current_password"
<<<<<<< HEAD
                        value="Current Password"
=======
                        value="Palavra-passe Atual"
>>>>>>> origin/team-b/rafael-oliveira
                    />

                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) =>
                            setData('current_password', e.target.value)
                        }
                        type="password"
<<<<<<< HEAD
                        className="mt-1 block w-full"
=======
                        className="mt-1 block w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
>>>>>>> origin/team-b/rafael-oliveira
                        autoComplete="current-password"
                    />

                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                <div>
<<<<<<< HEAD
                    <InputLabel htmlFor="password" value="New Password" />
=======
                    <InputLabel htmlFor="password" value="Nova Palavra-passe" />
>>>>>>> origin/team-b/rafael-oliveira

                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
<<<<<<< HEAD
                        className="mt-1 block w-full"
=======
                        className="mt-1 block w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
>>>>>>> origin/team-b/rafael-oliveira
                        autoComplete="new-password"
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
<<<<<<< HEAD
                        value="Confirm Password"
=======
                        value="Confirmar Palavra-passe"
>>>>>>> origin/team-b/rafael-oliveira
                    />

                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        type="password"
<<<<<<< HEAD
                        className="mt-1 block w-full"
=======
                        className="mt-1 block w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
>>>>>>> origin/team-b/rafael-oliveira
                        autoComplete="new-password"
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center gap-4">
<<<<<<< HEAD
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Saved.
=======
                    <button 
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
                    >
                        Guardar
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Guardado.
>>>>>>> origin/team-b/rafael-oliveira
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/team-b/rafael-oliveira
