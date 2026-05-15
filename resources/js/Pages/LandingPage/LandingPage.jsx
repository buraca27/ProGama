import React, { useState, useEffect } from "react";
import "./landingPage.css";
import { Link } from '@inertiajs/react';

// ── Imagens (mantidas exatamente iguais ao original) ─────────────────────────
import logo            from "./Imagens/logo.png";
import carrousel1      from "./Imagens/carrousel1.png";
import carrousel2      from "./Imagens/carrousel2.png";
import mascote         from "./Imagens/Mascote.png";
import mascoteteste    from "./Imagens/teste-mascote.png";
import mascotedesafio  from "./Imagens/desafio-mascote.png";
import mascoteOk       from "./Imagens/ok-mascote.png";
import mascoteTriste   from "./Imagens/mascote-triste.png";
import mascoteTriste2  from "./Imagens/mascote-triste2.png";

// Imagens locais de fallback (usadas quando o slide não tem imagem definida na BD)
const slideImagensFallback = [carrousel1, carrousel2, mascoteOk];

// =============================================================================
// COMPONENTES INTERNOS (iguais ao original)
// =============================================================================

const PerfilCardHorizontal = ({ classeExtra, icone, sub, titulo, lista }) => (
    <div className={`card-perfil-horizontal ${classeExtra}`}>
        <div className="card-perfil-header">
            <div className="perfil-icon-container">
                <span className="emoji-grande">{icone}</span>
            </div>
            <div className="perfil-header-info">
                <span className="perfil-sub">{sub}</span>
                <h3>{titulo}</h3>
            </div>
        </div>
        <div className="card-perfil-content">
            <ul>
                {lista.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </div>
    </div>
);

const FeedbackTico = ({ tipo, img, status, lista }) => (
    <div className={`feedback-mini-card ${tipo}`}>
        <div className="feedback-icon-box">
            <img src={img} alt={status} className="img-tico-small" />
            <span className="label-status">{status}</span>
        </div>
        <div className="feedback-text">
            <ul>
                {lista.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </div>
    </div>
);

// =============================================================================
// PÁGINA PRINCIPAL
//
// DIFERENÇA em relação ao original:
//   ANTES → export default function LandingPage() { ...dados hardcoded... }
//   AGORA → export default function LandingPage({ conteudo }) { ...dados do Laravel... }
//
// O Laravel envia os dados assim no controller:
//   return Inertia::render('LandingPage', ['conteudo' => $conteudo]);
// =============================================================================

export default function LandingPage({ conteudo }) {

    // Desembalar as secções vindas do Laravel
    const { slides, informacoes, desafios, testes, footer } = conteudo;

    const [nivelSelecionado, setNivelSelecionado] = useState(0);
    const [currentSlide, setCurrentSlide]         = useState(0);
    const [direction, setDirection]               = useState("next");
    const [menuAberto, setMenuAberto]             = useState(false);

    // Avanço automático do carrossel
    useEffect(() => {
        const timer = setInterval(() => {
            setDirection("next");
            setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 10000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const moveSlide = (dir) => {
        setDirection(dir);
        if (dir === "next") setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        else                setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    return (
        <div className="pagina-total">

            {/* ================================================================
                HEADER
            ================================================================ */}
            <header className="header-centered">
                <div className="header-left">
                    <img src={logo} alt="ProGama Logo" className="logo-img" />
                </div>

                {/* Menu normal — visível em desktop */}
                <nav className="nav-bar-center">
                    <a href="#"             className="nav-link">Início</a>
                    <a href="#informacoes"  className="nav-link">Informações</a>
                    <a href="#desafios"     className="nav-link">Desafios</a>
                    <a href="#testes"       className="nav-link">Testes</a>


                </nav>

                <div className="header-right">
                    <img src={mascote} alt="Mascote" className="mascote-img" />
                    <button className="login-btn">
                        <Link href={route('login')}>Fazer Login</Link>
                    </button>

                    {/* Botão hambúrguer — visível apenas em mobile */}
                    <button
                        className="menu-hamburguer"
                        onClick={() => setMenuAberto(!menuAberto)}
                        aria-label="Abrir menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>

                {/* Menu mobile — aparece ao clicar no hambúrguer */}
                <nav className={`nav-mobile ${menuAberto ? "aberto" : ""}`}>
                    <a href="#"            className="nav-link" onClick={() => setMenuAberto(false)}>Início</a>
                    <a href="#testes"      className="nav-link" onClick={() => setMenuAberto(false)}>Testes</a>
                    <a href="#desafios"    className="nav-link" onClick={() => setMenuAberto(false)}>Desafios</a>
                    <a href="#informacoes" className="nav-link" onClick={() => setMenuAberto(false)}>Informações</a>
                </nav>
            </header>

            <main className="main-content">

                {/* ================================================================
                    CARROSSEL
                ================================================================ */}
                <section id="inicio" className="carrousel-section">
                    <button className="carousel-control prev" onClick={() => moveSlide("prev")}>&#10094;</button>

                    <div className={`carrousel-animation-wrapper animated-${direction}`} key={currentSlide}>
                        <div className="carrousel-container">
                            <div className="carrousel-content">
                                {/* ANTES: <h1>Realizar Testes e Desafios Online</h1> */}
                                {/* AGORA: vem do Laravel */}
                                <h1>{slides[currentSlide].titulo}</h1>
                                <p>{slides[currentSlide].subtitulo}</p>
                                <a href={route('login')} className="carrousel-cta">Começar agora</a>
                            </div>
                            <div className="carrousel-visual">
                                <div className="carrousel-image-card">
                                    <img
                                        src={slides[currentSlide].imagem || slideImagensFallback[currentSlide] || carrousel1}
                                        alt="ProGama"
                                        className="carrousel-img"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="carousel-control next" onClick={() => moveSlide("next")}>&#10095;</button>

                    {/* Dots indicadores de slide */}
                    <div className="carrousel-dots">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                className={`carrousel-dot ${currentSlide === i ? "ativo" : ""}`}
                                onClick={() => { setDirection(i > currentSlide ? "next" : "prev"); setCurrentSlide(i); }}
                                aria-label={`Slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </section>

                {/* ================================================================
                    INFORMAÇÕES
                ================================================================ */}
                <section id="informacoes" className="informacoes-section">
                    {/* ANTES: <h1 className="titulo-seccao">Características do ProGama?</h1> */}
                    {/* AGORA: */}
                    <h1 className="titulo-seccao">{informacoes.titulo}</h1>
                    <div className="sublinhado-seccao"></div>

                    <p className="informacoes-subtitle">
                        A plataforma <strong>ProGama</strong> {informacoes.subtitulo.replace(/^A plataforma ProGama\s*/i, "")}
                    </p>

                    <div className="informacoes-container">
                        <div className="info-perfil-card professor-card">
                            <div className="info-perfil-icon-wrapper"><span>👨‍🏫</span></div>
                            <h2>{informacoes.professor.titulo}</h2>
                            <p>{informacoes.professor.descricao}</p>
                        </div>
                        <div className="info-perfil-card aluno-card">
                            <div className="info-perfil-icon-wrapper"><span>🧑‍🎓</span></div>
                            <h2>{informacoes.aluno.titulo}</h2>
                            <p>{informacoes.aluno.descricao}</p>
                        </div>
                    </div>

                    {/* Parágrafos extra — adicionados pelo editor */}
                    {Array.isArray(informacoes.paragrafos_extra) && informacoes.paragrafos_extra.length > 0 && (
                        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 32, maxWidth: 700, marginLeft: "auto", marginRight: "auto", width: "100%" }}>
                            {informacoes.paragrafos_extra.map((p, i) => (
                                <div key={i} style={{ textAlign: "center" }}>
                                    {p.titulo && (
                                        <h3 style={{
                                            fontSize: "1.6rem",
                                            fontWeight: 800,
                                            color: "#3a88ed",
                                            textTransform: "uppercase",
                                            letterSpacing: "-0.5px",
                                            margin: "0 0 12px 0",
                                        }}>{p.titulo}</h3>
                                    )}
                                    <p style={{
                                        fontSize: "1.2rem",
                                        color: "#666",
                                        lineHeight: 1.6,
                                        margin: 0,
                                    }}>{p.texto}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ================================================================
                    DESAFIOS
                ================================================================ */}
                <section id="desafios" className="desafios-section">
                    <div className="desafios-header">
                        {/* ANTES: <h1 className="titulo-desafios-especial">Características dos Desafios no ProGama</h1> */}
                        {/* AGORA: */}
                        <h1 className="titulo-desafios-especial">{desafios.titulo}</h1>
                        <div className="titulo-sublinhado"></div>
                        <p className="desafios-descricao">
                            Os <strong>Desafios</strong> {desafios.subtitulo.replace(/^Os Desafios\s*/i, "")}
                        </p>
                    </div>

                    <div className="acoes-desafios-container">
                        {/* ANTES: lista hardcoded ["Criar desafios de lógica personalizados", ...] */}
                        {/* AGORA: vem de desafios.professor.lista */}
                        <PerfilCardHorizontal
                            classeExtra="professor-style"
                            icone="👨‍🏫"
                            sub="Professor"
                            titulo={desafios.professor.titulo}
                            lista={desafios.professor.lista}
                        />
                        <PerfilCardHorizontal
                            classeExtra="aluno-style"
                            icone="🧑‍🎓"
                            sub="Aluno"
                            titulo={desafios.aluno.titulo}
                            lista={desafios.aluno.lista}
                        />
                    </div>

                    <div className="desafios-main-container">
                        <div className="path-container-full">
                            <div className="path-line-back"></div>
                            {/* ANTES: niveis era uma constante hardcoded no topo do componente */}
                            {/* AGORA: vem de desafios.niveis */}
                            {desafios.niveis.map((nivel, index) => (
                                <div
                                    key={nivel.id}
                                    className={`nivel-item ${nivelSelecionado === index ? "active" : ""}`}
                                    onClick={() => setNivelSelecionado(index)}
                                >
                                    <div className="nivel-circulo"><span>{nivel.emoji}</span></div>
                                    <span className="nivel-nome">{nivel.nome}</span>
                                </div>
                            ))}
                        </div>

                        <div className="requisitos-display" key={nivelSelecionado}>
                            <div className="requisitos-card">
                                <span className="badge-nivel">Nível {nivelSelecionado + 1}</span>
                                <h3>{desafios.niveis[nivelSelecionado].nome}</h3>
                                <p>{desafios.niveis[nivelSelecionado].req}</p>
                            </div>
                        </div>
                    </div>

                    <div className="resultados-wrapper-integrado">
                        <div className="resultados-header-clean">
                            <h2>Guia de Resultados</h2>
                            <p>O que acontece no final de cada desafio?</p>
                        </div>
                        <div className="feedback-container-horizontal">
                            <FeedbackTico
                                tipo="vitoria"
                                img={mascotedesafio}
                                status={desafios.resultados.vitoria.status}
                                lista={desafios.resultados.vitoria.lista}
                            />
                            <FeedbackTico
                                tipo="aprendizagem"
                                img={mascoteTriste}
                                status={desafios.resultados.derrota.status}
                                lista={desafios.resultados.derrota.lista}
                            />
                        </div>
                    </div>
                </section>

                {/* ================================================================
                    TESTES
                ================================================================ */}
                <section id="testes" className="testes-section">
                    <h1 className="titulo-seccao">{testes.titulo}</h1>
                    <div className="sublinhado-seccao"></div>
                    <p className="testes-subtitle">
                        O sistema de testes do <strong>ProGama</strong> {testes.subtitulo.replace(/^O sistema de testes do ProGama\s*/i, "")}
                    </p>

                    <div className="testes-acoes-container">
                        <PerfilCardHorizontal
                            classeExtra="professor-style"
                            icone="🧑‍🏫"
                            sub="Professor"
                            titulo={testes.professor.titulo}
                            lista={testes.professor.lista}
                        />
                        <PerfilCardHorizontal
                            classeExtra="aluno-style"
                            icone="🧑‍🎓"
                            sub="Aluno"
                            titulo={testes.aluno.titulo}
                            lista={testes.aluno.lista}
                        />
                    </div>

                    <div className="resultados-wrapper-integrado">
                        <div className="resultados-header-clean">
                            <h2>Guia de Resultados</h2>
                            <p>O que acontece no final de cada teste?</p>
                        </div>
                        <div className="feedback-container-horizontal">
                            <FeedbackTico
                                tipo="vitoria"
                                img={mascoteteste}
                                status={testes.resultados.aprovado.status}
                                lista={testes.resultados.aprovado.lista}
                            />
                            <FeedbackTico
                                tipo="aprendizagem"
                                img={mascoteTriste2}
                                status={testes.resultados.reprovado.status}
                                lista={testes.resultados.reprovado.lista}
                            />
                        </div>
                    </div>
                </section>

            </main>

            {/* ================================================================
                FOOTER
            ================================================================ */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-brand-section">
                        <div className="footer-logo-box">
                            <img src={logo} alt="ProGama Logo" className="footer-logo-img" />
                            <span className="footer-brand-name">ProGama</span>
                        </div>
                        {/* ANTES: <p className="footer-tagline">Agora com o ProGama tu divertes-te na escola.</p> */}
                        {/* AGORA: */}
                        <p className="footer-tagline">{footer.tagline}</p>
                    </div>
                    <div className="footer-contact-section">
                        <h4>Contacto</h4>
                        <div className="footer-contact-info">
                            <p>📍 {footer.localizacao}</p>
                            <p>📧 {footer.email}</p>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div className="footer-divider"></div>
                    <div className="footer-bottom-flex">
                        <p>© 2026 ProGama - Plataforma de Testes e Desafios Online | Todos os direitos reservados.</p>
                        <div className="footer-links">
                            <a href="#">Privacidade</a>
                            <a href="#">Termos</a>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
}
