import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Verify2FA() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('2fa.store'));
    };

    return (
        <GuestLayout>
            <Head title="Verificação de 2 Passos" />

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Para tua segurança, enviámos um código de 6 dígitos para o teu email.
                Por favor, introduz o código abaixo para concluir a tua sessão.
            </div>

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Não encontras o email?{' '}
                <a
                    href="https://progama.pt:2096/webmail"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                >
                    Abre o teu Webmail
                </a>
            </div>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="code" value="Código de Acesso" />

                    <TextInput
                        id="code"
                        type="text"
                        name="code"
                        value={data.code}
                        className="mt-1 block w-full text-center tracking-[0.5em] text-xl font-bold"
                        autoComplete="one-time-code"
                        isFocused={true}
                        onChange={(e) => setData('code', e.target.value)}
                        maxLength="6"
                        placeholder="123456"
                    />

                    <InputError message={errors.code} className="mt-2 text-center" />
                </div>

                <div className="flex items-center justify-end mt-6">
                    <PrimaryButton className="w-full justify-center" disabled={processing}>
                        Verificar Autenticação
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}