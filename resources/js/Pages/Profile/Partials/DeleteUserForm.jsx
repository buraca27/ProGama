<<<<<<< HEAD
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
=======
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
>>>>>>> origin/team-b/rafael-oliveira
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
<<<<<<< HEAD
                <h2 className="text-lg font-medium text-gray-900">
                    Delete Account
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>
                Delete Account
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Are you sure you want to delete your account?
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        Once your account is deleted, all of its resources and
                        data will be permanently deleted. Please enter your
                        password to confirm you would like to permanently delete
                        your account.
=======
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Eliminar Conta
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Assim que a sua conta for eliminada, todos os seus recursos e dados
                    serão eliminados permanentemente. Antes de eliminar a sua conta,
                    por favor descarregue quaisquer dados ou informações que deseje reter.
                </p>
            </header>

            <button
                onClick={confirmUserDeletion}
                className="inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-red-600 shadow-sm transition duration-150 ease-in-out hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-25 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
            >
                Eliminar Conta
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Tem a certeza que deseja eliminar a sua conta?
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Assim que a sua conta for eliminada, todos os seus recursos e dados
                        serão eliminados permanentemente. Por favor, introduza a sua palavra-passe
                        para confirmar que deseja eliminar permanentemente a sua conta.
>>>>>>> origin/team-b/rafael-oliveira
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
<<<<<<< HEAD
                            value="Password"
=======
                            value="Palavra-passe"
>>>>>>> origin/team-b/rafael-oliveira
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
<<<<<<< HEAD
                            className="mt-1 block w-3/4"
                            isFocused
                            placeholder="Password"
=======
                            className="mt-1 block w-3/4 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            isFocused
                            placeholder="Palavra-passe"
>>>>>>> origin/team-b/rafael-oliveira
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
<<<<<<< HEAD
                        <SecondaryButton onClick={closeModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton className="ms-3" disabled={processing}>
                            Delete Account
                        </DangerButton>
=======
                        <button
                            type="button"
                            onClick={closeModal}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="ms-3 inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-red-600 shadow-sm transition duration-150 ease-in-out hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-25 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
                        >
                            Eliminar Conta
                        </button>
>>>>>>> origin/team-b/rafael-oliveira
                    </div>
                </form>
            </Modal>
        </section>
    );
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/team-b/rafael-oliveira
