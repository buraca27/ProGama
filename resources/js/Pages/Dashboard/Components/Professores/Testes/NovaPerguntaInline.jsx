import React from "react";
import { TIPO_PERGUNTA_OPTIONS } from "./constants";

export default function NovaPerguntaInline({
    value,
    onChange,
    onRemove,
    onMoveUp,
    onMoveDown,
    title = "Nova pergunta",
    categorias = [],
}) {
    const update = (field, fieldValue) =>
        onChange({ ...value, [field]: fieldValue });

    const updateOpcao = (index, newValue) => {
        const next = [...(value.opcoes || ["", ""])];
        next[index] = newValue;
        update("opcoes", next);
    };

    const addOpcao = () => update("opcoes", [...(value.opcoes || []), ""]);

    const removeOpcao = (index) => {
        const next = (value.opcoes || []).filter((_, i) => i !== index);
        update("opcoes", next.length ? next : ["", ""]);
        if ((value.resposta_correta_index ?? 0) >= next.length) {
            update("resposta_correta_index", 0);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result;
            update("url_anexo_pergunta", base64);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 bg-indigo-50/40 dark:bg-indigo-900/20 space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h5 className="font-bold text-indigo-900 dark:text-indigo-200">
                    {title}
                </h5>
                <div className="flex items-center gap-2">
                    {onMoveUp && (
                        <button
                            type="button"
                            onClick={onMoveUp}
                            className="px-2 py-1.5 rounded-md text-sm font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200"
                            title="Mover para cima"
                        >
                            ↑
                        </button>
                    )}
                    {onMoveDown && (
                        <button
                            type="button"
                            onClick={onMoveDown}
                            className="px-2 py-1.5 rounded-md text-sm font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200"
                            title="Mover para baixo"
                        >
                            ↓
                        </button>
                    )}
                    {onRemove && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="px-3 py-1.5 rounded-md text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200"
                        >
                            Remover
                        </button>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Enunciado
                </label>
                <textarea
                    value={value.texto || ""}
                    onChange={(e) => update("texto", e.target.value)}
                    rows={3}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Escreve a pergunta..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pontuação da pergunta
                </label>
                <input
                    type="number"
                    min="1"
                    max="20"
                    value={value.pontuacao || 1}
                    onChange={(e) => {
                        const val = Math.min(
                            20,
                            Math.max(1, Number(e.target.value)),
                        );
                        update("pontuacao", val);
                    }}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoria
                </label>
                <select
                    value={value.id_categoria || ""}
                    onChange={(e) =>
                        update("id_categoria", Number(e.target.value))
                    }
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    required
                >
                    <option value="">Seleciona uma categoria...</option>
                    {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nome}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Foto / Anexo (opcional)
                </label>
                <div className="space-y-3">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-700 dark:text-gray-300 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                    />
                    {value.url_anexo_pergunta && (
                        <div className="relative inline-block">
                            <img
                                src={value.url_anexo_pergunta}
                                alt="Anexo da pergunta"
                                className="max-h-40 rounded-lg border border-gray-200 dark:border-gray-600 object-contain"
                            />
                            <button
                                type="button"
                                onClick={() => update("url_anexo_pergunta", null)}
                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center shadow"
                                title="Remover imagem"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de pergunta
                </label>
                <select
                    value={value.tipo_pergunta || "Dissertativa"}
                    onChange={(e) => update("tipo_pergunta", e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                    {TIPO_PERGUNTA_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {value.tipo_pergunta === "Escolha_Multipla" && (
                <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Opções
                    </p>
                    {(value.opcoes || []).map((op, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={op}
                                onChange={(e) =>
                                    updateOpcao(index, e.target.value)
                                }
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                placeholder={`Opção ${index + 1}`}
                            />
                            <button
                                type="button"
                                onClick={() => removeOpcao(index)}
                                className="px-2 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={addOpcao}
                            className="px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200"
                        >
                            + Opção
                        </button>
                        <select
                            value={value.resposta_correta_index ?? 0}
                            onChange={(e) =>
                                update(
                                    "resposta_correta_index",
                                    Number(e.target.value),
                                )
                            }
                            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            {(value.opcoes || []).map((_, index) => (
                                <option key={index} value={index}>
                                    Correta: opção {index + 1}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {value.tipo_pergunta === "Verdadeiro_Falso" && (
                <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Resposta correta
                    </p>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input
                                type="radio"
                                checked={Boolean(
                                    value.resposta_verdadeiro_falso,
                                )}
                                onChange={() =>
                                    update("resposta_verdadeiro_falso", true)
                                }
                            />
                            Verdadeiro
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input
                                type="radio"
                                checked={
                                    !Boolean(value.resposta_verdadeiro_falso)
                                }
                                onChange={() =>
                                    update("resposta_verdadeiro_falso", false)
                                }
                            />
                            Falso
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}
