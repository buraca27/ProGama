import React, { useState, useEffect } from "react";
import "./landingPage.css";
import { Link } from '@inertiajs/react';

// Imagens
import logo from "./Imagens/logo.png";
import carrousel1 from "./Imagens/carrousel1.png";
import carrousel2 from "./Imagens/carrousel2.png";
import mascote from "./Imagens/Mascote.png";
import mascoteteste from "./Imagens/teste-mascote.png";
import mascotedesafio from "./Imagens/desafio-mascote.png";
import mascoteOk from "./Imagens/ok-mascote.png";
import mascoteTriste from "./Imagens/mascote-triste.png";
import mascoteTriste2 from "./Imagens/mascote-triste2.png";

// Componente para os Cards de Professor/Aluno (Evita repetir)
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

// Componente para os Feedbacks do Tico
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

export default function LandingPage({ auth }) {
    const [nivelSelecionado, setNivelSelecionado] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState("next");

    const niveis = [
        { nome: "Iniciante", emoji: "🌱", req: "Foca-se em conceitos fundamentais, vocabulário básico e identificação de elementos principais através de exercícios de escolha múltipla." },
        { nome: "Estudante", emoji: "📚", req: "Requer a resolução de problemas intermédios e exercícios de interpretação que ligam diferentes temas da mesma disciplina." },
        { nome: "Mestre", emoji: "🏆", req: "Desafios que exigem a capacidade de síntese, resolução de casos complexos e aplicação de fórmulas ou regras gramaticais avançadas." },
        { nome: "Grande Mestre", emoji: "👑", req: "Reservado para alunos que dominam a matéria ao ponto de conseguirem resolver desafios interdisciplinares sob pressão de tempo." },
    ];

    const slides = [
        { titulo: "Realizar Testes e Desafios Online", subtitulo: "A plataforma ideal para consolidar conhecimentos em qualquer disciplina.", imagem: carrousel1 },
        { titulo: "Criar Testes e Desafios", subtitulo: "Usar o ProGama para avaliar e testar os conhecimentos dos alunos", imagem: carrousel2 },
        { titulo: "A Nossa Mascote: Tico", subtitulo: "A mascote do ProGama chama-se Tico, e ele vai-se tornar o teu melhor amigo", imagem: mascoteOk },
    ];

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
        else setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    return (
        <div className="pagina-total">
            <header className="header-centered">
                <div className="header-left">
                    <img src={logo} alt="ProGama Logo" className="logo-img" />
                </div>
                <nav className="nav-bar-center">
                    <a href="#" className="nav-link">Início</a>
                    <a href="#testes" className="nav-link">Testes</a>
                    <a href="#desafios" className="nav-link">Desafios</a>
                    <a href="#informacoes" className="nav-link">Informações</a>
                </nav>
                <div className="header-right">
                    <img src={mascote} alt="Mascote" className="mascote-img" />
                    <button className="login-btn">
                        <Link href={route('login')}>Fazer Login</Link>
                    </button>
                </div>
            </header>

            <main className="main-content">
                <section id="inicio" className="carrousel-section">
                    <button className="carousel-control prev" onClick={() => moveSlide("prev")}>&#10094;</button>
                    <div className={`carrousel-animation-wrapper animated-${direction}`} key={currentSlide}>
                        <div className="carrousel-container">
                            <div className="carrousel-content">
                                <h1>{slides[currentSlide].titulo}</h1>
                                <p>{slides[currentSlide].subtitulo}</p>
                            </div>
                            <div className="carrousel-visual">
                                <div className="carrousel-image-card">
                                    <img src={slides[currentSlide].imagem} alt="ProGama" className="carrousel-img" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="carousel-control next" onClick={() => moveSlide("next")}>&#10095;</button>
                </section>

                <section id="informacoes" className="informacoes-section">
                    <h1 className="titulo-seccao">Características do ProGama?</h1>
                    <div className="sublinhado-seccao"></div>
                    <p className="informacoes-subtitle">A plataforma <strong>ProGama</strong> foi preparada para fins escolares para ser utilizada por professores e alunos.</p>
                    <div className="informacoes-container">
                        <div className="info-perfil-card professor-card">
                            <div className="info-perfil-icon-wrapper"><span>👨‍🏫</span></div>
                            <h2>Professor</h2>
                            <p>Pode criar e gerir testes e desafios para atribui-los aos alunos.</p>
                        </div>
                        <div className="info-perfil-card aluno-card">
                            <div className="info-perfil-icon-wrapper"><span>🧑‍🎓</span></div>
                            <h2>Aluno</h2>
                            <p>Tem de resolver os testes e desafios que lhe são propostos, e pode ganhar pontos e subir de nível.</p>
                        </div>
                    </div>
                </section>

                <section id="desafios" className="desafios-section">
                    <div className="desafios-header">
                        <h1 className="titulo-desafios-especial">Características dos Desafios no ProGama</h1>
                        <div className="titulo-sublinhado"></div>
                        <p className="desafios-descricao">Os <strong>Desafios</strong> são missões interativas criadas pelo professor para o aluno.</p>
                    </div>

                    <div className="acoes-desafios-container">
                        <PerfilCardHorizontal
                            classeExtra="professor-style" icone="👨‍🏫" sub="Professor" titulo="Desafiante"
                            lista={["Criar desafios de lógica personalizados", "Definir recompensas e níveis"]}
                        />
                        <PerfilCardHorizontal
                            classeExtra="aluno-style" icone="🧑‍🎓" sub="Aluno" titulo="Desafiador"
                            lista={["Subir no ranking global", "Ganhar medalhas exclusivas", "Aprender através do jogo"]}
                        />
                    </div>

                    <div className="desafios-main-container">
                        <div className="path-container-full">
                            <div className="path-line-back"></div>
                            {niveis.map((nivel, index) => (
                                <div key={index} className={`nivel-item ${nivelSelecionado === index ? "active" : ""}`} onClick={() => setNivelSelecionado(index)}>
                                    <div className="nivel-circulo"><span>{nivel.emoji}</span></div>
                                    <span className="nivel-nome">{nivel.nome}</span>
                                </div>
                            ))}
                        </div>
                        <div className="requisitos-display" key={nivelSelecionado}>
                            <div className="requisitos-card">
                                <span className="badge-nivel">Nível {nivelSelecionado + 1}</span>
                                <h3>{niveis[nivelSelecionado].nome}</h3>
                                <p>{niveis[nivelSelecionado].req}</p>
                            </div>
                        </div>
                    </div>

                    <div className="resultados-wrapper-integrado">
                        <div className="resultados-header-clean">
                            <h2>Mascote Tico: Guia de Resultados</h2>
                            <p>O que acontece no final de cada desafio?</p>
                        </div>
                        <div className="feedback-container-horizontal">
                            <FeedbackTico tipo="vitoria" img={mascotedesafio} status="Ganhaste!" lista={["Sobes no Ranking", "Ganhas medalhas", "Ganhas afeição do Tico"]} />
                            <FeedbackTico tipo="aprendizagem" img={mascoteTriste} status="Falhas-te" lista={["Vês a correção imediata", "Não ganhas pontos", "O Tico motiva-te a continuar"]} />
                        </div>
                    </div>
                </section>

                <section id="testes" className="testes-section">
                    <h1 className="titulo-seccao">Características Dos Testes Online</h1>
                    <div className="sublinhado-seccao"></div>
                    <p className="testes-subtitle">O sistema de testes do <strong>ProGama</strong> foi desenhado para oferecer uma avaliação precisa e dinâmica...</p>

                    <div className="testes-acoes-container">
                        <PerfilCardHorizontal
                            classeExtra="professor-style" icone="🧑‍🏫" sub="Professor" titulo="Criação e Gestão"
                            lista={["Personalizar questões e limites de tempo", "Gerar pautas de avaliação automáticas", "Analisar estatísticas de desempenho da turma"]}
                        />
                        <PerfilCardHorizontal
                            classeExtra="aluno-style" icone="🧑‍🎓" sub="Aluno" titulo="Prática e Revisão"
                            lista={["Responder a testes com cronómetro real", "Aceder a correções detalhadas na hora", "Acompanhar a evolução das tuas notas"]}
                        />
                    </div>

                    <div className="resultados-wrapper-integrado">
                        <div className="resultados-header-clean">
                            <h2>Guia de Resultados</h2>
                            <p>O que acontece no final de cada teste?</p>
                        </div>
                        <div className="feedback-container-horizontal">
                            <FeedbackTico tipo="vitoria" img={mascoteteste} status="Aprovou" lista={["Nota superior a 50%", "Professor e Aluno Recebem FeedBack"]} />
                            <FeedbackTico tipo="aprendizagem" img={mascoteTriste2} status="Reprovou" lista={["Professor e Aluno Recebem FeedBack", "Analisar as correções do Tico"]} />
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-brand-section">
                        <div className="footer-logo-box">
                            <img src={logo} alt="ProGama Logo" className="footer-logo-img" />
                            <span className="footer-brand-name">ProGama</span>
                        </div>
                        <p className="footer-tagline">Agora com o ProGama tu divertes-te na escola.</p>
                    </div>
                    <div className="footer-contact-section">
                        <h4>Contacto</h4>
                        <div className="footer-contact-info">
                            <p>📍 Porto, Portugal</p>
                            <p>📧 suporte@progama.pt</p>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div className="footer-divider"></div>
                    <div className="footer-bottom-flex">
                        <p>© 2026 ProGama - Plataforma de Testes e Desafios Online| Todos os direitos reservados.</p>
                        <div className="footer-links"><a href="#">Privacidade</a><a href="#">Termos</a></div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
