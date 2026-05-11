// resources/js/utils.js
export const compressImageToBase64 = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_SIZE = 150;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL("image/webp", 0.6);
            callback(dataUrl);
        };
    };
};

export const formatDateTime = (value, locale = "pt-PT") => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatTipoPergunta = (tipo) =>
    String(tipo || "").replaceAll("_", " ");

export const getStatusCorrecao = (submissao) => {
    if (!submissao?.estado) {
        return { label: "Pendente", tone: "slate" };
    }

    const statusMap = {
        Aguardando_Correcao: { label: "Aguardando Correção", tone: "amber" },
        Em_Resolucao: { label: "Em Resolução", tone: "blue" },
        Corrigido: { label: "Corrigido", tone: "emerald" },
    };

    return (
        statusMap[submissao.estado] || {
            label: submissao.estado,
            tone: "slate",
        }
    );
};

export const getStatusTarefa = (tarefa, submissao) => {
    const now = new Date();
    const abre = tarefa?.data_hora_abertura
        ? new Date(tarefa.data_hora_abertura)
        : null;
    const fecha = tarefa?.data_hora_fecho
        ? new Date(tarefa.data_hora_fecho)
        : null;

    if (submissao?.data_submissao) {
        if (submissao.estado === "Corrigido") {
            return { label: "Corrigido", tone: "emerald" };
        }

        return { label: "Submetido", tone: "blue" };
    }

    if (abre && now < abre) {
        return { label: "Por abrir", tone: "slate" };
    }

    if (fecha && now > fecha) {
        return { label: "Prazo encerrado", tone: "red" };
    }

    return { label: "Disponivel", tone: "amber" };
};
