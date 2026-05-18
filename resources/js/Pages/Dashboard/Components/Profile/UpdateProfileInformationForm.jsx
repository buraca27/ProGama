import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import ImageCropModal from "@/Components/ImageCropModal";
import { Link, useForm, usePage } from "@inertiajs/react";
import { useRef, useState } from "react";

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
}) {
    const user = usePage().props.auth.user;
    const fileInputRef = useRef(null);

    const [cropSrc, setCropSrc] = useState(null);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            email_pessoal: user.email_pessoal || "",
            foto_perfil: user.foto_perfil || "",
        });

    const handleFotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setCropSrc(reader.result);
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCropConfirm = async (blobUrl) => {
        const res = await fetch(blobUrl);
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onload = () => {
            setData("foto_perfil", reader.result);
            setCropSrc(null);
            URL.revokeObjectURL(blobUrl);
        };
        reader.readAsDataURL(blob);
    };

    const submit = (e) => {
        e.preventDefault();
        patch(route("profile.update"));
    };

    return (
        <section className={className}>
            {cropSrc && (
                <ImageCropModal
                    imageSrc={cropSrc}
                    onConfirm={handleCropConfirm}
                    onCancel={() => setCropSrc(null)}
                />
            )}

            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Informação do Perfil
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Atualiza as informações e o endereço de email da tua conta.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* ÁREA DA FOTOGRAFIA */}
                <div className="flex items-center gap-4">
                    <div
                        onClick={() => fileInputRef.current.click()}
                        className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        title="Clica para alterar a foto"
                    >
                        {data.foto_perfil ? (
                            <img
                                src={data.foto_perfil}
                                alt="Perfil"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-2xl font-bold text-gray-500">
                                {data.name.charAt(0)}
                            </span>
                        )}
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="text-sm font-bold text-blue-600 dark:text-blue-400"
                        >
                            Alterar Fotografia
                        </button>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Podes ajustar o zoom e cortar após selecionar.
                        </p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFotoUpload}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="name" value="Nome Completo" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
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
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        required
                        autoComplete="username"
                        disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        O email institucional não pode ser alterado por ti.
                    </p>
                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel
                        htmlFor="email_pessoal"
                        value="Email Pessoal / Perfil Social"
                    />
                    <TextInput
                        id="email_pessoal"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email_pessoal}
                        onChange={(e) =>
                            setData("email_pessoal", e.target.value)
                        }
                        autoComplete="email"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Adiciona um email pessoal para o teu perfil social e
                        contatos.
                    </p>
                    <InputError
                        className="mt-2"
                        message={errors.email_pessoal}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>
                        Guardar Alterações
                    </PrimaryButton>
                    {recentlySuccessful && (
                        <p className="text-sm text-green-600 dark:text-green-400 font-bold">
                            Guardado com sucesso!
                        </p>
                    )}
                </div>
            </form>
        </section>
    );
}
