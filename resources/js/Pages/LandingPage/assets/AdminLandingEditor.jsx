import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { router } from '@inertiajs/react';

// ── Hook que deteta o tema Tailwind (classe 'dark' no <html>) ────────────────
function useDarkMode() {
    const [dark, setDark] = useState(() =>
        document.documentElement.classList.contains('dark')
    );
    useEffect(() => {
        const obs = new MutationObserver(() =>
            setDark(document.documentElement.classList.contains('dark'))
        );
        obs.observe(document.documentElement, { attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);
    return dark;
}

// ── Context do tema ─────────────────────────────────────────────────────────
const StylesCtx = createContext({});

// ── Estilos inline — mudam com o tema ────────────────────────────────────────
const getStyles = (dark) => ({
    body:        { display: "flex", flexDirection: "column", gap: 24 },
    card:        { background: dark ? "#1e293b" : "#fff", borderRadius: 12, border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`, overflow: "hidden" },
    cardHeader:  { padding: "16px 24px", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`, display: "flex", alignItems: "center", gap: 10 },
    cardTitle:   { fontSize: 15, fontWeight: 600, margin: 0, color: dark ? "#e2e8f0" : "#111827" },
    cardBody:    { padding: 24, display: "flex", flexDirection: "column", gap: 16 },
    row:         { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    field:       { display: "flex", flexDirection: "column", gap: 6 },
    label:       { fontSize: 12, fontWeight: 600, color: dark ? "#94a3b8" : "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" },
    input:       { border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#e5e7eb"}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit", background: dark ? "rgba(255,255,255,0.07)" : "#f9fafb", color: dark ? "#e2e8f0" : "#111827" },
    textarea:    { border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#e5e7eb"}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", minHeight: 80, background: dark ? "rgba(255,255,255,0.07)" : "#f9fafb", color: dark ? "#e2e8f0" : "#111827" },
    badge:       { fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: dark ? "#312e81" : "#ede9fe", color: dark ? "#a5b4fc" : "#4f46e5" },
    divider:     { border: "none", borderTop: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`, margin: "4px 0" },
    listRow:     { display: "flex", gap: 8, alignItems: "center" },
    listInput:   { flex: 1, border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#e5e7eb"}`, borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none", fontFamily: "inherit", background: dark ? "rgba(255,255,255,0.07)" : "#f9fafb", color: dark ? "#e2e8f0" : "#111827" },
    removeBtn:   { background: "none", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 13 },
    addBtn:      { background: "none", border: "1px dashed #a5b4fc", color: "#4f46e5", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 500 },
    tabRow:      { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" },
    tab:         { border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#e5e7eb"}`, background: dark ? "rgba(255,255,255,0.05)" : "#f9fafb", color: dark ? "#cbd5e1" : "#374151", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13 },
    tabActive:   { border: "1px solid #4f46e5", background: dark ? "#312e81" : "#ede9fe", color: dark ? "#a5b4fc" : "#4f46e5", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600 },
    saveBtn:     { background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer" },
    saveBtnOk:   { background: "#16a34a" },
    saveBtnErr:  { background: "#dc2626" },
    emoji:       { fontSize: 18 },
    tabRemove:   { border: "1px solid #fca5a5", background: "none", color: "#dc2626", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11, marginLeft: 2 },
    imgPreview:  { width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8, border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#e5e7eb"}`, marginTop: 6 },
    imgPlaceholder: { width: "100%", height: 100, borderRadius: 8, border: `1px dashed ${dark ? "rgba(255,255,255,0.2)" : "#d1d5db"}`, background: dark ? "rgba(255,255,255,0.03)" : "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", color: dark ? "#64748b" : "#9ca3af", fontSize: 13, marginTop: 6 },
    uploadArea:  { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
    uploadBtn:   { background: dark ? "rgba(255,255,255,0.07)" : "#f3f4f6", border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#e5e7eb"}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500, color: dark ? "#cbd5e1" : "#374151" },
    paragrafoCard: { background: dark ? "rgba(255,255,255,0.04)" : "#f9fafb", border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`, borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 8 },
    paragrafoHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
});

// ── Sub-componentes reutilizáveis ────────────────────────────────────────────

const Field = ({ label, value, onChange, type = "text", rows }) => {
    const s = useContext(StylesCtx);
    return (
        <div style={s.field}>
            <label style={s.label}>{label}</label>
            {rows
                ? <textarea style={s.textarea} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
                : <input style={s.input} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
            }
        </div>
    );
};

const ListEditor = ({ lista, onChange }) => {
    const s = useContext(StylesCtx);
    const update = (i, val) => { const n = [...lista]; n[i] = val; onChange(n); };
    const remove = (i)      => onChange(lista.filter((_, idx) => idx !== i));
    const add    = ()       => onChange([...lista, ""]);
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {lista.map((item, i) => (
                <div key={i} style={s.listRow}>
                    <input style={s.listInput} value={item} onChange={(e) => update(i, e.target.value)} />
                    <button style={s.removeBtn} onClick={() => remove(i)}>✕</button>
                </div>
            ))}
            <button style={s.addBtn} onClick={add}>+ Adicionar item</button>
        </div>
    );
};

const Section = ({ icon, title, badge, children }) => {
    const s = useContext(StylesCtx);
    return (
        <div style={s.card}>
            <div style={s.cardHeader}>
                <span style={s.emoji}>{icon}</span>
                <h2 style={s.cardTitle}>{title}</h2>
                {badge && <span style={s.badge}>{badge}</span>}
            </div>
            <div style={s.cardBody}>{children}</div>
        </div>
    );
};

// ── Editor de imagem (upload ou URL) ─────────────────────────────────────────
const ImagemEditor = ({ value, onChange }) => {
    const s = useContext(StylesCtx);
    const [modo, setModo] = useState(value && !value.startsWith("data:") ? "url" : "upload");
    const fileRef = useRef();

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onChange(ev.target.result);
        reader.readAsDataURL(file);
    };

    return (
        <div style={s.field}>
            <label style={s.label}>Imagem do slide</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button
                    style={{ ...s.tab, ...(modo === "upload" ? { borderColor: "#4f46e5", color: "#4f46e5", background: "#ede9fe", fontWeight: 600 } : {}) }}
                    onClick={() => setModo("upload")}
                >📁 Upload</button>
                <button
                    style={{ ...s.tab, ...(modo === "url" ? { borderColor: "#4f46e5", color: "#4f46e5", background: "#ede9fe", fontWeight: 600 } : {}) }}
                    onClick={() => setModo("url")}
                >🔗 URL</button>
            </div>

            {modo === "upload" ? (
                <div style={s.uploadArea}>
                    <button style={s.uploadBtn} onClick={() => fileRef.current.click()}>
                        📂 Escolher ficheiro
                    </button>
                    <span style={{ fontSize: 12, color: "#999" }}>JPG, PNG, WEBP, GIF</span>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
                </div>
            ) : (
                <input
                    style={s.input}
                    type="url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={value && !value.startsWith("data:") ? value : ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            )}

            {value
                ? <img src={value} alt="preview" style={s.imgPreview} />
                : <div style={s.imgPlaceholder}>Sem imagem selecionada</div>
            }
        </div>
    );
};

// ── Editor de parágrafos extra ────────────────────────────────────────────────
const ParagrafosEditor = ({ paragrafos, onChange }) => {
    const s = useContext(StylesCtx);
    const add    = ()       => onChange([...paragrafos, { titulo: "", texto: "" }]);
    const remove = (i)      => onChange(paragrafos.filter((_, idx) => idx !== i));
    const update = (i, campo, val) => {
        const next = paragrafos.map((p, idx) => idx === i ? { ...p, [campo]: val } : p);
        onChange(next);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={s.label}>📝 Parágrafos extra</span>
                <button style={s.addBtn} onClick={add}>+ Adicionar parágrafo</button>
            </div>
            {paragrafos.length === 0 && (
                <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>Nenhum parágrafo extra. Clique em "+ Adicionar parágrafo" para começar.</p>
            )}
            {paragrafos.map((p, i) => (
                <div key={i} style={s.paragrafoCard}>
                    <div style={s.paragrafoHeader}>
                        <span style={{ ...s.label, textTransform: "none", fontSize: 13, color: "#6366f1" }}>Parágrafo {i + 1}</span>
                        <button style={s.removeBtn} onClick={() => remove(i)}>✕ Remover</button>
                    </div>
                    <Field
                        label="Título (opcional)"
                        value={p.titulo}
                        onChange={(v) => update(i, "titulo", v)}
                    />
                    <Field
                        label="Texto"
                        value={p.texto}
                        onChange={(v) => update(i, "texto", v)}
                        rows={3}
                    />
                </div>
            ))}
        </div>
    );
};

// ── Painel principal ─────────────────────────────────────────────────────────
export default function AdminLandingEditor({ conteudo }) {
    const dark = useDarkMode();
    const s    = getStyles(dark);

    // Garante que o form tem os campos novos mesmo que o backend ainda não os envie
    const [form, setForm] = useState(() => {
        const c = JSON.parse(JSON.stringify(conteudo));
        // migração segura: adicionar imagem a slides existentes
        if (c.slides) c.slides = c.slides.map(sl => ({ imagem: "", ...sl }));
        // migração segura: adicionar paragrafos_extra a informacoes
        if (c.informacoes && !Array.isArray(c.informacoes.paragrafos_extra)) {
            c.informacoes.paragrafos_extra = [];
        }
        return c;
    });

    const [estadoGuardar, setEstado]  = useState("idle");
    const [slideAtivo, setSlideAtivo] = useState(0);
    const [nivelAtivo, setNivelAtivo] = useState(0);

    const guardar = () => {
        setEstado("loading");
        router.put(route('admin.landing.update'), form, {
            preserveScroll: true,
            onSuccess: () => { setEstado("ok");   setTimeout(() => setEstado("idle"), 3000); },
            onError:   () => { setEstado("erro"); setTimeout(() => setEstado("idle"), 3000); },
        });
    };

    // Mutação profunda por caminho
    const set = (path, val) => {
        const clone = JSON.parse(JSON.stringify(form));
        const keys  = path.split(".");
        let obj = clone;
        for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
        obj[keys[keys.length - 1]] = val;
        setForm(clone);
    };

    const setSlide = (i, campo, val) => {
        const clone = JSON.parse(JSON.stringify(form));
        clone.slides[i][campo] = val;
        setForm(clone);
    };

    // ── Carrossel: adicionar / remover slides ────────────────────────────────
    const adicionarSlide = () => {
        const clone = JSON.parse(JSON.stringify(form));
        clone.slides.push({ titulo: "Novo slide", subtitulo: "", imagem: "" });
        setForm(clone);
        setSlideAtivo(clone.slides.length - 1);
    };

    const removerSlide = (i) => {
        if (form.slides.length <= 1) return; // mínimo 1 slide
        const clone = JSON.parse(JSON.stringify(form));
        clone.slides.splice(i, 1);
        setForm(clone);
        setSlideAtivo(Math.min(slideAtivo, clone.slides.length - 1));
    };

    // ── Informações: parágrafos extra ────────────────────────────────────────
    const setParagrafos = (lista) => {
        const clone = JSON.parse(JSON.stringify(form));
        clone.informacoes.paragrafos_extra = lista;
        setForm(clone);
    };

    const setNivel = (i, campo, val) => {
        const clone = JSON.parse(JSON.stringify(form));
        clone.desafios.niveis[i][campo] = val;
        setForm(clone);
    };

    const setLista = (secao, perfil, novaLista) => {
        const clone = JSON.parse(JSON.stringify(form));
        clone[secao][perfil].lista = novaLista;
        setForm(clone);
    };

    const setResultadoLista = (secao, resultado, novaLista) => {
        const clone = JSON.parse(JSON.stringify(form));
        clone[secao].resultados[resultado].lista = novaLista;
        setForm(clone);
    };

    const btnStyle = estadoGuardar === "ok"   ? { ...s.saveBtn, ...s.saveBtnOk }
                   : estadoGuardar === "erro" ? { ...s.saveBtn, ...s.saveBtnErr }
                   : s.saveBtn;

    const btnText  = estadoGuardar === "loading" ? "A guardar..."
                   : estadoGuardar === "ok"      ? "✓ Guardado!"
                   : estadoGuardar === "erro"    ? "✕ Erro ao guardar"
                   : "Guardar alterações";

    return (
        <StylesCtx.Provider value={s}>
        <div style={s.body}>

            {/* ── Título da vista + botão guardar ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: dark ? "#e2e8f0" : "#111827", margin: 0 }}>Editor da Landing Page</h2>
                    <p style={{ fontSize: 13, color: dark ? "#94a3b8" : "#6b7280", margin: "4px 0 0" }}>As alterações ficam visíveis imediatamente após guardar.</p>
                </div>
                <button style={btnStyle} onClick={guardar} disabled={estadoGuardar === "loading"}>
                    {btnText}
                </button>
            </div>

                {/* ── Carrossel ── */}
                <Section icon="🎠" title="Carrossel" badge={`${form.slides.length} slides`}>
                    {/* Tabs dos slides + botão adicionar */}
                    <div style={s.tabRow}>
                        {form.slides.map((_, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <button
                                    style={slideAtivo === i ? s.tabActive : s.tab}
                                    onClick={() => setSlideAtivo(i)}
                                >
                                    Slide {i + 1}
                                </button>
                                {form.slides.length > 1 && (
                                    <button
                                        style={s.tabRemove}
                                        title="Remover slide"
                                        onClick={() => removerSlide(i)}
                                    >✕</button>
                                )}
                            </div>
                        ))}
                        <button style={s.addBtn} onClick={adicionarSlide}>+ Novo slide</button>
                    </div>

                    {/* Campos do slide ativo */}
                    <Field label="Título" value={form.slides[slideAtivo].titulo}
                        onChange={(v) => setSlide(slideAtivo, "titulo", v)} />
                    <Field label="Subtítulo" value={form.slides[slideAtivo].subtitulo}
                        onChange={(v) => setSlide(slideAtivo, "subtitulo", v)} rows={2} />
                    <ImagemEditor
                        value={form.slides[slideAtivo].imagem}
                        onChange={(v) => setSlide(slideAtivo, "imagem", v)}
                    />
                </Section>

                {/* ── Informações ── */}
                <Section icon="ℹ️" title="Secção — Informações">
                    <div style={s.row}>
                        <Field label="Título da secção" value={form.informacoes.titulo}
                            onChange={(v) => set("informacoes.titulo", v)} />
                        <Field label="Subtítulo" value={form.informacoes.subtitulo}
                            onChange={(v) => set("informacoes.subtitulo", v)} />
                    </div>
                    <hr style={s.divider} />
                    <div style={s.row}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <span style={{ ...s.label, display: "block" }}>👨‍🏫 Card Professor</span>
                            <Field label="Título" value={form.informacoes.professor.titulo}
                                onChange={(v) => set("informacoes.professor.titulo", v)} />
                            <Field label="Descrição" value={form.informacoes.professor.descricao}
                                onChange={(v) => set("informacoes.professor.descricao", v)} rows={3} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <span style={{ ...s.label, display: "block" }}>🧑‍🎓 Card Aluno</span>
                            <Field label="Título" value={form.informacoes.aluno.titulo}
                                onChange={(v) => set("informacoes.aluno.titulo", v)} />
                            <Field label="Descrição" value={form.informacoes.aluno.descricao}
                                onChange={(v) => set("informacoes.aluno.descricao", v)} rows={3} />
                        </div>
                    </div>
                    <hr style={s.divider} />
                    {/* Parágrafos extra */}
                    <ParagrafosEditor
                        paragrafos={form.informacoes.paragrafos_extra}
                        onChange={setParagrafos}
                    />
                </Section>

                {/* ── Desafios ── */}
                <Section icon="⚔️" title="Secção — Desafios">
                    <div style={s.row}>
                        <Field label="Título" value={form.desafios.titulo}
                            onChange={(v) => set("desafios.titulo", v)} />
                        <Field label="Subtítulo" value={form.desafios.subtitulo}
                            onChange={(v) => set("desafios.subtitulo", v)} />
                    </div>
                    <hr style={s.divider} />
                    <div style={s.row}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <span style={{ ...s.label, display: "block" }}>👨‍🏫 Professor — ações</span>
                            <Field label="Título do card" value={form.desafios.professor.titulo}
                                onChange={(v) => set("desafios.professor.titulo", v)} />
                            <ListEditor lista={form.desafios.professor.lista}
                                onChange={(v) => setLista("desafios", "professor", v)} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <span style={{ ...s.label, display: "block" }}>🧑‍🎓 Aluno — ações</span>
                            <Field label="Título do card" value={form.desafios.aluno.titulo}
                                onChange={(v) => set("desafios.aluno.titulo", v)} />
                            <ListEditor lista={form.desafios.aluno.lista}
                                onChange={(v) => setLista("desafios", "aluno", v)} />
                        </div>
                    </div>
                    <hr style={s.divider} />
                    <span style={{ ...s.label, display: "block" }}>🗺️ Níveis</span>
                    <div style={s.tabRow}>
                        {form.desafios.niveis.map((n, i) => (
                            <button key={i} style={nivelAtivo === i ? s.tabActive : s.tab} onClick={() => setNivelAtivo(i)}>
                                {n.emoji} {n.nome}
                            </button>
                        ))}
                    </div>
                    <div style={s.row}>
                        <Field label="Nome do nível" value={form.desafios.niveis[nivelAtivo].nome}
                            onChange={(v) => setNivel(nivelAtivo, "nome", v)} />
                        <Field label="Emoji" value={form.desafios.niveis[nivelAtivo].emoji}
                            onChange={(v) => setNivel(nivelAtivo, "emoji", v)} />
                    </div>
                    <Field label="Descrição do nível" value={form.desafios.niveis[nivelAtivo].req}
                        onChange={(v) => setNivel(nivelAtivo, "req", v)} rows={3} />
                    <hr style={s.divider} />
                    <div style={s.row}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <span style={{ ...s.label, display: "block" }}>🏆 Resultado — Vitória</span>
                            <Field label="Label" value={form.desafios.resultados.vitoria.status}
                                onChange={(v) => set("desafios.resultados.vitoria.status", v)} />
                            <ListEditor lista={form.desafios.resultados.vitoria.lista}
                                onChange={(v) => setResultadoLista("desafios", "vitoria", v)} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <span style={{ ...s.label, display: "block" }}>😞 Resultado — Derrota</span>
                            <Field label="Label" value={form.desafios.resultados.derrota.status}
                                onChange={(v) => set("desafios.resultados.derrota.status", v)} />
                            <ListEditor lista={form.desafios.resultados.derrota.lista}
                                onChange={(v) => setResultadoLista("desafios", "derrota", v)} />
                        </div>
                    </div>
                </Section>

                {/* ── Testes ── */}
                <Section icon="📝" title="Secção — Testes">
                    <div style={s.row}>
                        <Field label="Título" value={form.testes.titulo}
                            onChange={(v) => set("testes.titulo", v)} />
                        <Field label="Subtítulo" value={form.testes.subtitulo}
                            onChange={(v) => set("testes.subtitulo", v)} />
                    </div>
                    <hr style={s.divider} />
                    <div style={s.row}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <span style={{ ...s.label, display: "block" }}>👨‍🏫 Professor</span>
                            <Field label="Título do card" value={form.testes.professor.titulo}
                                onChange={(v) => set("testes.professor.titulo", v)} />
                            <ListEditor lista={form.testes.professor.lista}
                                onChange={(v) => setLista("testes", "professor", v)} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <span style={{ ...s.label, display: "block" }}>🧑‍🎓 Aluno</span>
                            <Field label="Título do card" value={form.testes.aluno.titulo}
                                onChange={(v) => set("testes.aluno.titulo", v)} />
                            <ListEditor lista={form.testes.aluno.lista}
                                onChange={(v) => setLista("testes", "aluno", v)} />
                        </div>
                    </div>
                    <hr style={s.divider} />
                    <div style={s.row}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <span style={{ ...s.label, display: "block" }}>✅ Resultado — Aprovado</span>
                            <Field label="Label" value={form.testes.resultados.aprovado.status}
                                onChange={(v) => set("testes.resultados.aprovado.status", v)} />
                            <ListEditor lista={form.testes.resultados.aprovado.lista}
                                onChange={(v) => setResultadoLista("testes", "aprovado", v)} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <span style={{ ...s.label, display: "block" }}>❌ Resultado — Reprovado</span>
                            <Field label="Label" value={form.testes.resultados.reprovado.status}
                                onChange={(v) => set("testes.resultados.reprovado.status", v)} />
                            <ListEditor lista={form.testes.resultados.reprovado.lista}
                                onChange={(v) => setResultadoLista("testes", "reprovado", v)} />
                        </div>
                    </div>
                </Section>

                {/* ── Footer ── */}
                <Section icon="🦶" title="Footer">
                    <Field label="Tagline" value={form.footer.tagline}
                        onChange={(v) => set("footer.tagline", v)} />
                    <div style={s.row}>
                        <Field label="Localização" value={form.footer.localizacao}
                            onChange={(v) => set("footer.localizacao", v)} />
                        <Field label="Email" value={form.footer.email} type="email"
                            onChange={(v) => set("footer.email", v)} />
                    </div>
                </Section>

                <div style={{ textAlign: "right", paddingBottom: 8 }}>
                    <button style={btnStyle} onClick={guardar} disabled={estadoGuardar === "loading"}>
                        {btnText}
                    </button>
                </div>

        </div>
        </StylesCtx.Provider>
    );
}
