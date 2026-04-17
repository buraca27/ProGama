import { Link, Head } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Bem-vindo" />
            
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center selection:bg-blue-500 selection:text-white">
                <div className="max-w-3xl mx-auto p-6 lg:p-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Bem-vindo ao <span className="text-blue-600">ProGama</span>
                    </h1>
                    
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                        A plataforma ideal para gerir os teus projetos. Acede agora para começares a explorar as funcionalidades.
                    </p>
                    
                    {/* Lógica do Botão: Se estiver logado vai para o Dashboard, se não, vai para Login */}
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-lg hover:shadow-xl"
                        >
                            Ir para o Dashboard →
                        </Link>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={route('login')}
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-xl"
                            >
                                Entrar no Dashboard
                            </Link>
                            <Link
                                href={route('register')}
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-900 transition-all duration-200 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 shadow-sm"
                            >
                                Criar Conta
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
