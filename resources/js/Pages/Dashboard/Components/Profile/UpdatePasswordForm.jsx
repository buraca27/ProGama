import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PasswordInput from '@/Components/PasswordInput';
import { Transition } from '@headlessui/react';
import { useForm, usePage, router } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const user = usePage().props.auth.user;
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const [resetSent, setResetSent] = useState(false);
    const [resetSending, setResetSending] = useState(false);

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

    const sendResetLink = () => {
        setResetSending(true);
        router.post(route('profile.password.reset'), {}, {
            preserveScroll: true,
            onSuccess: () => { setResetSent(true); setResetSending(false); },
            onError: () => setResetSending(false),
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Atualizar Palavra-passe
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Garanta que a sua conta está a usar uma palavra-passe longa e aleatória para se manter segura.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Palavra-passe Atual"
                    />

                    <PasswordInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) =>
                            setData('current_password', e.target.value)
                        }
                        className="mt-1 block w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        autoComplete="current-password"
                    />

                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Nova Palavra-passe" />

                    <PasswordInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="mt-1 block w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        autoComplete="new-password"
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmar Palavra-passe"
                    />

                    <PasswordInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        className="mt-1 block w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        autoComplete="new-password"
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center gap-4">
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
                        </p>
                    </Transition>
                </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Não te lembras da palavra-passe atual? Envia um link de redefinição para o teu email{' '}
                    <span className="font-medium text-gray-800 dark:text-gray-200">({user?.email})</span>.
                </p>
                {resetSent ? (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Link de redefinição enviado! Verifica o teu email.
                    </p>
                ) : (
                    <button
                        type="button"
                        onClick={sendResetLink}
                        disabled={resetSending}
                        className="text-sm text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50 transition"
                    >
                        {resetSending ? 'A enviar...' : 'Enviar link de redefinição'}
                    </button>
                )}
            </div>
        </section>
    );
}
