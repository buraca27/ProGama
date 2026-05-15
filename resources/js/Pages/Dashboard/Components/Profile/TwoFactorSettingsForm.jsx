import { usePage, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import { useState } from 'react';

export default function TwoFactorSettingsForm() {
    // Vamos buscar os dados do utilizador atualmente logado
    const user = usePage().props.auth.user;
    const is2faEnabled = user.twofa_totp_enabled;
    
    const [processing, setProcessing] = useState(false);

    const toggle2FA = () => {
        setProcessing(true);
        // Fazemos o pedido PATCH para a nossa nova rota
        router.patch(route('profile.2fa.toggle'), {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <section className="bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg">
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Autenticação de Dois Fatores (2FA)
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Adiciona uma camada extra de segurança à tua conta. Quando ativado, 
                    ser-te-á pedido um código numérico enviado para o teu email sempre que tentares iniciar sessão.
                </p>
            </header>

            <div className="mt-6 flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <div>
                    <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">
                        Estado Atual: 
                        <span className={`ml-2 ${is2faEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {is2faEnabled ? 'Ativado' : 'Desativado'}
                        </span>
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {is2faEnabled 
                            ? 'O teu código será enviado para o teu email institucional no próximo login.' 
                            : 'A tua conta está protegida apenas pela password.'}
                    </p>
                </div>

                <div className="ml-4">
                    {is2faEnabled ? (
                        <DangerButton onClick={toggle2FA} disabled={processing}>
                            Desativar 2FA
                        </DangerButton>
                    ) : (
                        <PrimaryButton onClick={toggle2FA} disabled={processing}>
                            Ativar 2FA
                        </PrimaryButton>
                    )}
                </div>
            </div>
        </section>
    );
}