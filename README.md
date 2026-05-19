<div align="center">

# ProGama

**Plataforma Educativa com Gamificação**

*Aprende. Desafia-te. Evolui.*

---

![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Inertia.js](https://img.shields.io/badge/Inertia.js-2-9553E9?style=for-the-badge)

</div>

---

## Sobre o Projeto

O **ProGama** é uma plataforma educativa que transforma o processo de aprendizagem através da gamificação. Professores criam desafios e testes; alunos participam, ganham XP, sobem de nível e desbloqueiam badges — tornando o estudo mais envolvente e motivador.

---

## Funcionalidades Principais

### Para Alunos
- **Hub de Desafios** — Participa em desafios do tipo quiz ou tarefa com correção automática ou manual
- **Sistema de XP e Níveis** — Ganha pontos de experiência e progride num sistema de níveis
- **Badges e Conquistas** — Desbloqueia medalhas com raridades Bronze, Prata, Ouro e Lendário
- **Histórico de Atividade** — Consulta todo o teu percurso e evolução
- **Social** — Segue outros utilizadores e aceita pedidos de conexão
- **Notificações** — Mantém-te a par de novidades, correções e conquistas

### Para Professores
- **Criação de Desafios e Testes** — Configura questões, XP base, cooldowns e critérios de avaliação
- **Gestão de Badges** — Cria e atribui badges personalizados às turmas
- **Correção de Respostas** — Avalia submissões de alunos diretamente na plataforma
- **Gestão de Turmas e Disciplinas** — Organiza alunos por turmas e disciplinas

### Para Administradores
- **Painel de Controlo** — Gestão global de utilizadores, conteúdos e configurações
- **Editor da Landing Page** — Edita o conteúdo da página inicial diretamente na plataforma

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Backend | PHP 8.2+ / Laravel 12 |
| Frontend | React 18 + Inertia.js 2 |
| Estilização | Tailwind CSS 3 + Headless UI |
| Build | Vite 7 |
| Base de Dados | MySQL 8 |
| Autenticação | Laravel Sanctum + 2FA |

---

## Arquitetura

```
ProGama/
├── app/
│   ├── Http/Controllers/     # Controladores (lógica magra)
│   ├── Models/               # Modelos Eloquent
│   └── Services/             # Lógica de negócio encapsulada
├── database/
│   └── migrations/           # Toda a evolução do schema
├── resources/
│   └── js/
│       ├── Pages/            # Vistas React (por área)
│       └── Components/       # Componentes reutilizáveis
└── routes/
    ├── web.php
    └── auth.php
```

O projeto segue uma arquitetura **MVC com Inertia.js** — o Laravel serve as páginas como props JSON para componentes React, eliminando a necessidade de uma API REST separada. A lógica de negócio complexa (cálculo de XP, atribuição de badges, submissão de testes) é extraída para classes de Serviço dedicadas, mantendo os controladores limpos.

---

## Instalação e Configuração

### Pré-requisitos
- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL 8

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/buraca27/ProGama.git
cd ProGama

# 2. Instalar dependências PHP
composer install

# 3. Instalar dependências Node.js
npm install

# 4. Configurar o ambiente
cp .env.example .env
php artisan key:generate

# 5. Configurar a base de dados no ficheiro .env
# DB_DATABASE=progama
# DB_USERNAME=root
# DB_PASSWORD=

# 6. Executar migrações e seeders
php artisan migrate --seed

# 7. Compilar assets
npm run build

# 8. Iniciar o servidor
php artisan serve
```

Para desenvolvimento com hot-reload:
```bash
# Terminal 1
php artisan serve

# Terminal 2
npm run dev
```

---

## Perfis de Acesso

| Perfil | Descrição |
|---|---|
| **Aluno** | Participa em desafios e testes, acompanha a sua progressão |
| **Professor** | Cria e gere conteúdos, avalia submissões |
| **Administrador** | Gestão completa da plataforma |

---

## Modelos de Domínio

O domínio do projeto é modelado em português, refletindo o contexto educativo português:

`User` · `Turma` · `Disciplina` · `Categoria` · `Desafio` · `Badge` · `Level` · `UserXp` · `Pergunta` · `OpcaoPergunta` · `RespostaAluno` · `Teste` · `TesteRealizado` · `SubmissaoDesafioAluno` · `Notificacao` · `HistoricoAtividade` · `SolicitacaoConexao`

---

## Equipa

Projeto resultante da união de duas equipas cujos projetos se alinhavam — desenvolvido em colaboração para criar uma plataforma mais completa e robusta.

### Team DJN
| Nome | Papel |
|---|---|
| João Gomes | Team Leader |
| Daniel Borges | Membro |
| Nuno Costa | Membro |

### Team JRT
| Nome | Papel |
|---|---|
| Rafael Oliveira | Team Leader |
| João Santos | Membro |
| Tiago Maia | Membro |

---

<div align="center">

Feito com dedicação por **Team DJN** e **Team JRT**

</div>
