# Diretrizes do Projeto: programaGemini (Plataforma Educativa & Gamificação)

## 1. Stack Tecnológica
- **Backend:** PHP (Laravel)
- **Frontend:** React com Inertia.js
- **Estilização:** Tailwind CSS (compilado via Vite)
- **Base de Dados:** MySQL

## 2. Estrutura e Arquitetura
- **Rotas:** Localizadas primariamente em `routes/web.php` e `routes/auth.php`.
- **Backend (MVC):** Manter os Controladores "magros" (`app/Http/Controllers/`). Toda a lógica de negócio complexa (como as atribuições de badges, submissão de testes ou cálculo de métricas) deve ser extraída e encapsulada em classes de Serviço ou Actions dedicadas.
- **Frontend (React):**
  - Páginas completas (Views) estão estruturadas em `resources/js/Pages/` (divididas por áreas como Dashboard, LandingPage e Auth).
  - Componentes modulares e reutilizáveis de UI encontram-se em `resources/js/Components/`.
- **Base de Dados:** Qualquer evolução do esquema relacional é feita estritamente através de ficheiros em `database/migrations/`. Nenhuma alteração manual.

## 3. Regras de Domínio e Negócio
- **Perfis de Acesso:** A plataforma atende a diferentes entidades (Alunos, Professores, Administradores). O controlo de acesso deve ser rigorosamente verificado via Middleware (ex: `EnsureUserIsAdmin`) e Policies.
- **Nomenclatura do Domínio:** Os Modelos base (`app/Models/`) refletem o contexto do projeto em português (ex: `Turma`, `Disciplina`, `Teste`, `Desafio`, `Badge`, `HistoricoAtividade`). Deve-se manter esta consistência em novas entidades do domínio, adotando ao mesmo tempo as convenções standard do Laravel para nomes de tabelas, chaves estrangeiras e relacionamentos.
- **Validações de Input:** Usar sempre classes `FormRequest` para validar a entrada de dados antes da injeção nos Controladores.

## 4. Estilo de Código (Clean Code, Resiliência e Ownership)
- **Fluxo Lógico:** Privilegiar a técnica de *early returns* (retornos antecipados) para evitar aninhamento excessivo de blocos `if/else`, tornando a leitura linear.
- **Tratamento de Erros:** O código exige um nível alto de ownership e resiliência. Operações sensíveis na base de dados devem ser protegidas com `try/catch` ou transações (`DB::transaction()`), garantindo uma reposta amigável e segura no frontend em caso de falha.
- **Documentação:** O código deve ser autoexplicativo graças a uma boa nomenclatura de variáveis e métodos. Comentários devem existir apenas para justificar o "porquê" de uma decisão técnica específica, e nunca para descrever o "o quê".
