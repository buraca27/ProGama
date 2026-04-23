import React, { useState } from "react";
import "./landingPage.css";
import logo from "./logo.png";
import carrousel1 from "./carrousel1.png";
import mascote from "./Mascote.png";
import mascoteteste from "./teste-mascote.png";
import mascotedesafio from "./desafio-mascote.png";
import mascoteOk from "./ok-mascote.png";

export default function LandingPage(props) {
    const [nivelSelecionado, setNivelSelecionado] = useState(0);

    const niveis = [
        {
            nome: "Iniciante",
            emoji: "🌱",
            req: "",
        },
        {
            nome: "Estudante",
            emoji: "📚",
            req: "",
        },
        {
            nome: "Mestre",
            emoji: "🏆",
            req: "",
        },
        {
            nome: "Grande Mestre",
            emoji: "👑",
            req: "",
        },
    ];

    return (
        <div className="pagina-total">
            <header className="header-centered">
                <div className="header-left">
                    <img src={logo} alt="ProGama Logo" className="logo-img" />
                </div>

                <nav className="nav-bar-center">
                    <a href="#" className="nav-link">
                        Início
                    </a>
                    <a href="#" className="nav-link">
                        Testes
                    </a>
                    <a href="#" className="nav-link">
                        Desafios
                    </a>
                    <a href="#" className="nav-link">
                        Informações
                    </a>
                </nav>

                <div className="header-right">
                    <img src={mascote} alt="Mascote" className="mascote-img" />
                    <button className="login-btn">Entrar</button>
                </div>
            </header>

            {/* Main */}
            <main className="main-content">
                {/* Inicio*/}
                <section className="hero-section">
                    <div className="hero-content">
                        <h1>Realizar Teste e Desafios Online No ProGrama</h1>
                    </div>
                    <div className="hero-visual">
                        <img src={carrousel1} alt="" />
                    </div>
                </section>

                {/* FEATURES*/}
                <section className="features-grid">
                    <h1 className="titulo-seccao">
                        Características do ProGrama
                    </h1>
                    <div className="sublinhado-seccao"></div>

                    <div className="features-intro-block">
                        <div className="features-logo-side">
                            <img
                                src={logo}
                                alt="ProGrama Logo"
                                className="logo-grande-destaque"
                            />
                        </div>
                        <div className="features-text-side">
                            <h3>
                                A plataforma onde o ensino encontra a diversão
                            </h3>
                            <p>
                                O <strong>ProGrama</strong> é focado na criação
                                de testes e desafios online. Aqui, os{" "}
                                <strong>professores</strong> têm total liberdade
                                para criar conteúdos personalizados e
                                atribuí-los aos seus <strong>alunos</strong>,
                                que os resolvem num ambiente interativo e
                                gamificado.
                            </p>
                        </div>
                    </div>

                    <div className="features-container">
                        <div className="feature-item">
                            <img
                                src={mascoteteste}
                                alt="Mascote"
                                className="mascote-img"
                            />
                            <h3>Realizar Fichas/Testes</h3>
                            <p>Realizar Testes para avaliação.</p>
                        </div>
                        <div className="feature-item">
                            <img
                                src={mascotedesafio}
                                alt="Mascote"
                                className="mascote-img"
                            />
                            <h3>Desafios de Lógica</h3>
                            <p>Exercícios para treinar o cérebro.</p>
                        </div>
                    </div>
                </section>

                {/*SEÇÃO DE GAMIFICAÇÃO*/}
                <section className="gamification-section">
                    <h1 className="titulo-desafios-especial">
                        Características Dos Os Desafios
                    </h1>
                    <div className="titulo-sublinhado"></div>

                    <div className="path-container-full">
                        <div className="path-line-back"></div>
                        {niveis.map((nivel, index) => (
                            <div
                                key={index}
                                className={`nivel-item ${nivelSelecionado === index ? "active" : ""}`}
                                onClick={() => setNivelSelecionado(index)}
                            >
                                <div className="nivel-circulo">
                                    {nivel.emoji}
                                </div>
                                <span className="nivel-nome">{nivel.nome}</span>
                            </div>
                        ))}
                    </div>

                    <div className="requisitos-box">
                        <h3>Desafios {niveis[nivelSelecionado].nome}:</h3>
                        <p>{niveis[nivelSelecionado].req}</p>
                    </div>
                </section>

                {/* 4. SECÇÃO DE TESTES ONLINE */}
                <section className="testes-online-section">
                    <h1 className="titulo-seccao">
                        Características Dos Testes Online
                    </h1>
                    <div className="sublinhado-seccao"></div>

                    <div className="testes-grid-container">
                        <div className="teste-info-card">
                            <div className="teste-icon-wrapper">⏱️</div>
                            <h3>Cronometro</h3>
                            <p>
                                Tens de responder às perguntas do teste em antes
                                que o tempo acaba.
                            </p>
                            <div className="card-footer-tag">
                                Realizar testes em tempo real
                            </div>
                        </div>

                        <div className="teste-info-card">
                            <div className="teste-icon-wrapper">📊</div>
                            <h3>Gestão de Análise</h3>
                            <p>
                                Podes sabe logo a tua nota e ver a correção de
                                cada pergunta no final do teste.
                            </p>
                            <div className="card-footer-tag">
                                Feedback Instantâneo
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div>
                    © 2026 Portal de Estudos e de Desafios - ProGrama
                </div>
            </footer>
        </div>
    );
}
