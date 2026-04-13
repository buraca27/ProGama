import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
<<<<<<< HEAD
import PrimaryButton from '@/Components/PrimaryButton';
=======
>>>>>>> origin/team-b/rafael-oliveira
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
<<<<<<< HEAD
                <h2 className="text-lg font-medium text-gray-900">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information and email address.
=======
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Informação do Perfil
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Atualize a informação do perfil e o endereço de email da sua conta.
>>>>>>> origin/team-b/rafael-oliveira
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
<<<<<<< HEAD
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
=======
                    <InputLabel htmlFor="name" value="Nome" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
>>>>>>> origin/team-b/rafael-oliveira
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
<<<<<<< HEAD
                        className="mt-1 block w-full"
=======
                        className="mt-1 block w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
>>>>>>> origin/team-b/rafael-oliveira
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
<<<<<<< HEAD
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
=======
                        <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                            O seu endereço de email não está verificado.
>>>>>>> origin/team-b/rafael-oliveira
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
<<<<<<< HEAD
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
=======
                                className="rounded-md text-sm text-gray-600 dark:text-gray-400 underline hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                            >
                                Clique aqui para reenviar o email de verificação.
>>>>>>> origin/team-b/rafael-oliveira
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
<<<<<<< HEAD
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
=======
                            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                Um novo link de verificação foi enviado para o seu endereço de email.
>>>>>>> origin/team-b/rafael-oliveira
                            </div>
                        )}
                    </div>
                )}

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
                    {/* BOTÃO CORRIGIDO AQUI */}
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
