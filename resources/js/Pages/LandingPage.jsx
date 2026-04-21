import React, { useState } from "react";
import "./landingPage.css";
import logo from "./logo.png";
import carrousel1 from "./carrousel1.png";
import mascote from "./Mascote.png";
import mascoteteste from "./teste-mascote.png"
import mascotedesafio from "./desafio-mascote.png"




export default function LandingPage(props) {

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

            {/* 1. Main */}
            <main className="main-content">
                <section className="hero-section">
                    <div className="hero-content">
                        <h1>Realizar Teste e Desafios Online No ProGrama</h1>
                    </div>
                    <div className="hero-visual">
                        <img src={carrousel1} alt="" />
                    </div>
                </section>

                {/* 2. FEATURES */}
                <section className="features-grid">
                    <h1>Características do ProGrama</h1>
                    <div className="features-container">
                        {" "}
                        <img src="" alt="" />
                        <div className="feature-item">
                            <img src={mascoteteste} alt="Mascote" className="mascote-img" />
                            <h3>Realizar Fichas/Testes</h3>
                            <p>Realizar Testes para avaliação.</p>
                        </div>
                        <div className="feature-item">
                            <img src={mascotedesafio} alt="Mascote" className="mascote-img" />

                            <h3>Desafios de Lógica</h3>
                            <p>Exercícios para treinar o cérebro.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div>
                    © 2026 Portal de Estudos - Sistema Integrado React & Laravel
                </div>
            </footer>
        </div>
    );
}
