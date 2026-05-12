import React, { useState } from "react";
import { useForm, router } from "@inertiajs/react";
import SearchBar from "@/Components/UI/SearchBar";

export default function CategoriasView({ categorias, userRole }) {
    // ==========================================
    // ESTADOS DOS MODAIS E FILTRO
    // ==========================================
    const [categoriaToEdit, setCategoriaToEdit] = useState(null);
    const [categoriaToDelete, setCategoriaToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // ==========================================
    // LÓGICA DO FORMULÁRIO DE CRIAR CATEGORIAS
    // ==========================================
    const {
        data: categoriaD,
        setData: setCategoriaD,
        post: postCategoria,
        processing: processingCategoria,
        reset: resetCategoria,
    } = useForm({
        nome: "",
        descricao: "",
    });

    const submitNovaCategoria = (e) => {
        e.preventDefault();
        postCategoria(route("categorias.store"), {
            preserveScroll: true,
            onSuccess: () => resetCategoria(),
        });
    };

    // ==========================================
    // LÓGICA DE EDITAR E APAGAR CATEGORIAS
    // ==========================================
    const submitEditCategoria = (e) => {
        e.preventDefault();
        router.put(
            `/dashboard/categorias/${categoriaToEdit.id}`,
            {
                nome: categoriaToEdit.nome,
                descricao: categoriaToEdit.descricao || "",
            },
            {
                preserveScroll: true,
                onSuccess: () => setCategoriaToEdit(null),
            }
        );
    };

    const confirmDeleteCategoria = () => {
        router.delete(`/dashboard/categorias/${categoriaToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setCategoriaToDelete(null),
        });
    };

    // ==========================================
    // LÓGICA DO FILTRO DE PESQUISA
    // ==========================================
    const filteredCategorias = categorias
        ? categorias.filter((c) =>
              c.nome.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];

    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* ---------------------------------------------------------
                1. FORMULÁRIO DE CRIAÇÃO (APENAS PARA ADMIN)
            --------------------------------------------------------- */}
            {userRole === "admin" && (
                <form
                    onSubmit={submitNovaCategoria}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col gap-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome da Categoria *
                        </label>
                        <input
                            type="text"
                            value={categoriaD.nome}
                            onChange={(e) => setCategoriaD("nome", e.target.value)}
                            required
                            placeholder="Ex: Programação, Matemática, Lógica..."
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descrição
                        </label>
                        <textarea
                            value={categoriaD.descricao}
                            onChange={(e) => setCategoriaD("descricao", e.target.value)}
                            placeholder="Breve descrição da categoria (opcional)"
                            rows={2}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            disabled={processingCategoria}
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-bold shadow-sm transition-colors"
                        >
                            + Adicionar Categoria
                        </button>
                    </div>
                </form>
            )}

            {/* ---------------------------------------------------------
                2. BARRA DE PESQUISA
            --------------------------------------------------------- */}
            {categorias && categorias.length > 0 && (
                <SearchBar
                    placeholder="Pesquisar categoria por nome..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                    onClear={() => setSearchTerm("")}
                />
            )}

            {/* ---------------------------------------------------------
                3. LISTAGEM DE CATEGORIAS
            --------------------------------------------------------- */}
            {filteredCategorias.length > 0 ? (
                filteredCategorias.map((categoria) => (
                    <div
                        key={categoria.id}
                        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        {/* CABEÇALHO DA CATEGORIA */}
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                                {categoria.nome}
                            </h3>

                            {/* Badges de contagem + Botões Admin */}
                            {userRole === "admin" && (
                                <div className="flex gap-2 items-center flex-wrap">
                                    <span className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs px-3 py-1 rounded-full font-bold flex items-center">
                                        {categoria.desafios_count ?? categoria.desafios?.length ?? 0} Desafios
                                    </span>
                                    <span className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 text-xs px-3 py-1 rounded-full font-bold flex items-center mr-2">
                                        {categoria.testes_count ?? categoria.testes?.length ?? 0} Testes
                                    </span>
                                    <button
                                        onClick={() => setCategoriaToEdit(categoria)}
                                        className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1 rounded font-bold text-sm transition-colors"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => setCategoriaToDelete(categoria)}
                                        className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded font-bold text-sm transition-colors"
                                    >
                                        Apagar
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* DESCRIÇÃO DA CATEGORIA */}
                        {categoria.descricao ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                {categoria.descricao}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-400 dark:text-gray-600 italic">
                                Sem descrição.
                            </p>
                        )}
                    </div>
                ))
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors">
                    <span className="text-5xl mb-4 block opacity-50">🏷️</span>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Nenhuma Categoria Encontrada
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {searchTerm
                            ? "Não encontrámos nenhuma categoria com essa pesquisa."
                            : userRole === "admin"
                            ? "Usa o formulário acima para criar a primeira categoria."
                            : "De momento, não existem categorias disponíveis."}
                    </p>
                </div>
            )}

            {/* =========================================================
                MODAIS DE ADMINISTRAÇÃO (EDITAR / APAGAR)
            ========================================================= */}

            {/* MODAL EDITAR CATEGORIA */}
            {categoriaToEdit && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form
                        onSubmit={submitEditCategoria}
                        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700"
                    >
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            Editar Categoria
                        </h2>
                        <div className="space-y-4 mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nome *
                                <input
                                    type="text"
                                    value={categoriaToEdit.nome}
                                    onChange={(e) =>
                                        setCategoriaToEdit({
                                            ...categoriaToEdit,
                                            nome: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </label>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Descrição
                                <textarea
                                    value={categoriaToEdit.descricao || ""}
                                    onChange={(e) =>
                                        setCategoriaToEdit({
                                            ...categoriaToEdit,
                                            descricao: e.target.value,
                                        })
                                    }
                                    rows={3}
                                    placeholder="Breve descrição da categoria (opcional)"
                                    className="w-full border-gray-300 rounded mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </label>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setCategoriaToEdit(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-colors"
                            >
                                Guardar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL APAGAR CATEGORIA */}
            {categoriaToDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-red-200 dark:border-red-900">
                        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                            Apagar Categoria?
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Tens a certeza que queres apagar a categoria{" "}
                            <strong>{categoriaToDelete.nome}</strong>? Os
                            desafios e testes associados ficarão sem categoria.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setCategoriaToDelete(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeleteCategoria}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors shadow-sm"
                            >
                                Sim, Apagar Categoria
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
