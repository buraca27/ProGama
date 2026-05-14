import { useEffect, useState } from "react";

function calcRestante(dataFimStr) {
    return Math.max(0, Math.floor((new Date(dataFimStr).getTime() - Date.now()) / 1000));
}

function formatarRestante(seg) {
    if (seg <= 0) return { texto: "Encerrado", urgente: true };
    const dias = Math.floor(seg / 86400);
    const horas = Math.floor((seg % 86400) / 3600);
    const min  = Math.floor((seg % 3600) / 60);
    const s    = seg % 60;
    if (dias > 0)   return { texto: `${dias}d ${horas}h`, urgente: false };
    if (horas > 0)  return { texto: `${horas}h ${String(min).padStart(2, "0")}m`, urgente: horas < 2 };
    if (min > 0)    return { texto: `${min}m ${String(s).padStart(2, "0")}s`, urgente: true };
    return { texto: `${s}s`, urgente: true };
}

export default function PrazoCountdownItem({ alerta }) {
    const [restante, setRestante] = useState(() => calcRestante(alerta.data_fim));

    useEffect(() => {
        // Atualiza a cada segundo se falta menos de 1 hora, senão a cada 30s
        const intervalo = restante < 3600 ? 1000 : 30_000;
        const id = setInterval(() => setRestante(calcRestante(alerta.data_fim)), intervalo);
        return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alerta.data_fim]);

    const { texto, urgente } = formatarRestante(restante);

    return (
        <div className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
            urgente
                ? "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20"
                : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
        }`}>
            <div className="flex items-start gap-3 min-w-0">
                <span className="mt-0.5 text-xl flex-shrink-0">⏰</span>
                <div className="min-w-0">
                    <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                        Prazo Próximo
                    </span>
                    <p className="mt-1.5 text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                        {alerta.titulo}
                    </p>
                    <p className={`mt-1 text-xs font-semibold tabular-nums ${urgente ? "text-orange-600 dark:text-orange-400" : "text-gray-500 dark:text-gray-400"}`}>
                        Fecha em{" "}
                        <span className={urgente ? "text-orange-700 dark:text-orange-300" : "text-gray-700 dark:text-gray-200"}>
                            {texto}
                        </span>
                        {" — "}
                        {new Date(alerta.data_fim).toLocaleString("pt-PT", {
                            day: "2-digit", month: "2-digit", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                        })}
                    </p>
                </div>
            </div>
        </div>
    );
}
