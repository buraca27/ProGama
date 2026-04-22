import { Link, Head } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Error({ status }) {
    // Definir os títulos conforme o erro
    const title = {
        503: 'Serviço Indisponível',
        404: 'Página Não Encontrada',
        403: 'Acesso Negado',
    }[status] || 'Ocorreu um erro';

    // Definir as mensagens amigáveis
    const description = {
        503: 'Lamentamos, estamos em manutenção. Volta daqui a pouco.',
        404: 'A página que procuras não existe ou foi movida.',
        403: 'Não tens permissão para aceder a esta página ou executar esta ação.',
    }[status] || 'Ocorreu um erro inesperado.';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4 transition-colors duration-200">
            <Head title={title} />
            
            <div className="text-center max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-center mb-6">
                    <ApplicationLogo className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                </div>
                
                <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {status}
                </h1>
                
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">
                    {title}
                </h2>
                
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    {description}
                </p>
                
                <Link 
                    href="/dashboard" 
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors duration-200 w-full"
                >
                    Voltar de forma segura ao Dashboard
                </Link>
            </div>
        </div>
    );
}