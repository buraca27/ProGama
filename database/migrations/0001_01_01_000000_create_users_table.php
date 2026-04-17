<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ==========================================
        // 1. TABELAS INDEPENDENTES (Sem chaves estrangeiras)
        // ==========================================
        Schema::create('Turmas', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->string('ano_letivo', 20);
            $table->timestamps();
        });

        Schema::create('Niveis', function (Blueprint $table) {
            $table->id();
            $table->integer('numero_nivel')->unique();
            $table->integer('xp_minimo');
            $table->string('titulo_nivel', 100)->nullable();
            $table->string('icone_url', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('Roles', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->text('descricao')->nullable();
            $table->timestamps();
        });

        Schema::create('Permissoes', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->text('descricao')->nullable();
            $table->timestamps();
        });

        Schema::create('Categorias', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->timestamps();
        });

        Schema::create('Badges', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->text('descricao')->nullable();
            $table->string('imagem_url', 255)->nullable();
            $table->timestamps();
        });

        // ==========================================
        // 2. TABELAS DE LIGAÇÃO (Primeiro Nível)
        // ==========================================
        Schema::create('Roles_Permissoes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_role');
            $table->unsignedBigInteger('id_permissao');
            $table->boolean('valor')->default(true);
            $table->text('nota')->nullable();
            $table->timestamps();

            $table->foreign('id_role')->references('id')->on('Roles')->onDelete('cascade');
            $table->foreign('id_permissao')->references('id')->on('Permissoes')->onDelete('cascade');
            $table->unique(['id_role', 'id_permissao']);
        });

        // TABELA USERS (A tua 'Utilizadores' adaptada para o Laravel)
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255); // Adaptado de 'nome'
            $table->string('email', 255)->unique();
            $table->string('password', 255);
            $table->string('nif', 20)->unique()->nullable();
            $table->date('data_nascimento')->nullable();

            // RBAC e Gamificação
            $table->unsignedBigInteger('id_role')->nullable();
            $table->integer('xp_total')->default(0);
            $table->unsignedBigInteger('id_nivel')->default(1);
            $table->unsignedBigInteger('id_turma')->nullable();

            // Segurança extra solicitada
            $table->string('activation_token', 64)->nullable();
            $table->dateTime('email_activation_timestamp')->nullable();
            $table->boolean('twofa_totp_enabled')->default(false);
            $table->string('twofa_code', 6)->nullable();
            $table->dateTime('twofa_expires')->nullable();
            $table->dateTime('last_login')->nullable();

            // Defaults do Laravel
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();

            // Chaves Estrangeiras
            $table->foreign('id_role')->references('id')->on('Roles');
            $table->foreign('id_nivel')->references('id')->on('Niveis');
            $table->foreign('id_turma')->references('id')->on('Turmas')->onDelete('set null');
        });

        // Tabelas de sistema obrigatórias do Laravel
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        Schema::create('Grupos', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->unsignedBigInteger('id_turma');
            $table->timestamps();

            $table->foreign('id_turma')->references('id')->on('Turmas')->onDelete('cascade');
        });

        // ==========================================
        // TABELA PIVOT: Professores podem lecionar múltiplas turmas
        // ==========================================
        Schema::create('Professor_Turma', function (Blueprint $table) {
            $table->unsignedBigInteger('id_professor');
            $table->unsignedBigInteger('id_turma');

            $table->primary(['id_professor', 'id_turma']);
            $table->foreign('id_professor')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_turma')->references('id')->on('Turmas')->onDelete('cascade');
            $table->timestamps();
        });

        // ==========================================
        // 3. TABELAS DE LIGAÇÃO (Segundo Nível - Dependem de Users)
        // ==========================================
        Schema::create('Grupo_Alunos', function (Blueprint $table) {
            $table->unsignedBigInteger('id_grupo');
            $table->unsignedBigInteger('id_aluno');

            $table->primary(['id_grupo', 'id_aluno']);
            $table->foreign('id_grupo')->references('id')->on('Grupos')->onDelete('cascade');
            $table->foreign('id_aluno')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('Seguidores', function (Blueprint $table) {
            $table->unsignedBigInteger('id_seguidor');
            $table->unsignedBigInteger('id_seguido');

            $table->primary(['id_seguidor', 'id_seguido']);
            $table->foreign('id_seguidor')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_seguido')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('Perguntas', function (Blueprint $table) {
            $table->id();
            $table->text('texto');
            $table->enum('tipo_pergunta', ['Escolha_Multipla', 'Verdadeiro_Falso', 'Dissertativa', 'Preenchimento', 'Upload_Ficheiro']);
            $table->string('url_anexo_pergunta', 255)->nullable();
            $table->unsignedBigInteger('id_categoria');
            $table->unsignedBigInteger('id_formador_criador');
            $table->timestamps();

            $table->foreign('id_categoria')->references('id')->on('Categorias');
            $table->foreign('id_formador_criador')->references('id')->on('users');
        });

        Schema::create('Testes', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 150);
            $table->enum('tipo_avaliacao', ['Teste_Formal', 'Ficha_Trabalho', 'Exame_Final']);
            $table->unsignedBigInteger('id_formador');
            $table->dateTime('data_hora_abertura');
            $table->dateTime('data_hora_fecho');
            $table->integer('duracao_minutos')->nullable();
            $table->decimal('peso_avaliacao', 5, 2)->default(0);
            $table->string('url_anexo_global', 255)->nullable();
            $table->timestamps();

            $table->foreign('id_formador')->references('id')->on('users');
        });

        // ==========================================
        // 4. RESTANTES TABELAS DEPENDENTES
        // ==========================================
        Schema::create('Opcoes_Pergunta', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_pergunta');
            $table->string('texto_opcao', 255);
            $table->boolean('is_correct')->default(false);
            $table->timestamps();

            $table->foreign('id_pergunta')->references('id')->on('Perguntas')->onDelete('cascade');
        });

        Schema::create('Testes_Perguntas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_teste');
            $table->unsignedBigInteger('id_pergunta');
            $table->integer('valor_pontuacao');
            $table->timestamps();

            $table->foreign('id_teste')->references('id')->on('Testes')->onDelete('cascade');
            $table->foreign('id_pergunta')->references('id')->on('Perguntas')->onDelete('cascade');
        });

        Schema::create('Testes_Atribuicoes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_teste');
            $table->unsignedBigInteger('id_turma')->nullable();
            $table->unsignedBigInteger('id_grupo')->nullable();
            $table->unsignedBigInteger('id_aluno')->nullable();
            $table->timestamps();

            $table->foreign('id_teste')->references('id')->on('Testes')->onDelete('cascade');
            $table->foreign('id_turma')->references('id')->on('Turmas')->onDelete('cascade');
            $table->foreign('id_grupo')->references('id')->on('Grupos')->onDelete('cascade');
            $table->foreign('id_aluno')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('Testes_Realizados', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_teste');
            $table->unsignedBigInteger('id_aluno');
            $table->dateTime('data_inicio_resolucao')->useCurrent();
            $table->dateTime('data_submissao')->nullable();
            $table->decimal('nota_final', 5, 2)->nullable();
            $table->enum('estado', ['Em_Resolucao', 'Aguardando_Correcao', 'Corrigido']);
            $table->timestamps();

            $table->foreign('id_teste')->references('id')->on('Testes')->onDelete('cascade');
            $table->foreign('id_aluno')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('Respostas_Alunos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_teste_realizado');
            $table->unsignedBigInteger('id_pergunta');
            $table->unsignedBigInteger('id_opcao_escolhida')->nullable();
            $table->text('resposta_texto')->nullable();
            $table->string('url_ficheiro_submetido', 255)->nullable();
            $table->enum('status_correcao', ['Correto', 'Errado', 'Por_Avaliar']);
            $table->integer('pontuacao_obtida')->default(0);
            $table->text('comentario_formador')->nullable();
            $table->timestamps();

            $table->foreign('id_teste_realizado')->references('id')->on('Testes_Realizados')->onDelete('cascade');
            $table->foreign('id_pergunta')->references('id')->on('Perguntas')->onDelete('cascade');
            $table->foreign('id_opcao_escolhida')->references('id')->on('Opcoes_Pergunta')->onDelete('set null');
        });

        Schema::create('Desafios', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 150);
            $table->text('descricao')->nullable();
            $table->unsignedBigInteger('id_formador');
            $table->enum('tipo_desafio', ['Obrigatorio', 'Opcional']);
            $table->enum('tipo_recorrencia', ['Unico', 'Diario', 'Semanal', 'Mensal']);
            $table->unsignedBigInteger('id_teste_associado')->nullable();
            $table->boolean('exige_submissao')->default(false);
            $table->integer('cooldown_minutos')->nullable();
            $table->dateTime('data_inicio');
            $table->dateTime('data_fim');
            $table->integer('duracao_minutos')->nullable();
            $table->boolean('ativo')->default(true);
            $table->timestamps();

            $table->foreign('id_formador')->references('id')->on('users');
            $table->foreign('id_teste_associado')->references('id')->on('Testes')->onDelete('set null');
        });

        Schema::create('Desafios_Perguntas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_desafio');
            $table->unsignedBigInteger('id_pergunta');
            $table->integer('pontuacao_extra')->default(0);
            $table->timestamps();

            $table->foreign('id_desafio')->references('id')->on('Desafios')->onDelete('cascade');
            $table->foreign('id_pergunta')->references('id')->on('Perguntas')->onDelete('cascade');
        });

        Schema::create('Desafios_Atribuicoes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_desafio');
            $table->unsignedBigInteger('id_turma')->nullable();
            $table->unsignedBigInteger('id_grupo')->nullable();
            $table->unsignedBigInteger('id_aluno')->nullable();
            $table->timestamps();

            $table->foreign('id_desafio')->references('id')->on('Desafios')->onDelete('cascade');
            $table->foreign('id_turma')->references('id')->on('Turmas')->onDelete('cascade');
            $table->foreign('id_grupo')->references('id')->on('Grupos')->onDelete('cascade');
            $table->foreign('id_aluno')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('Regras_Recompensa_Desafio', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_desafio');
            $table->unsignedBigInteger('id_badge')->nullable();
            $table->integer('xp_atribuido')->default(0);
            $table->enum('momento_atribuicao', ['Submissao_Automatica', 'Correcao_Manual']);
            $table->timestamps();

            $table->foreign('id_desafio')->references('id')->on('Desafios')->onDelete('cascade');
            $table->foreign('id_badge')->references('id')->on('Badges')->onDelete('set null');
        });

        Schema::create('Inscricoes_Desafios', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_desafio');
            $table->unsignedBigInteger('id_formando');
            $table->enum('estado', ['Pendente', 'Em_Resolucao', 'Submetido', 'Falhado', 'Concluido']);
            $table->string('caminho_ficheiro', 255)->nullable();
            $table->dateTime('data_inicio_resolucao')->nullable();
            $table->dateTime('data_ultima_tentativa')->nullable();
            $table->timestamps();

            $table->foreign('id_desafio')->references('id')->on('Desafios')->onDelete('cascade');
            $table->foreign('id_formando')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('Inventario_Badges', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_utilizador');
            $table->unsignedBigInteger('id_badge');
            $table->unsignedBigInteger('id_formador_atribuidor')->nullable();
            $table->string('motivo', 255)->nullable();
            $table->timestamp('data_obtencao')->useCurrent();
            $table->timestamps();

            $table->foreign('id_utilizador')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_badge')->references('id')->on('Badges')->onDelete('cascade');
            $table->foreign('id_formador_atribuidor')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('Notificacoes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_utilizador');
            $table->enum('tipo_notificacao', ['Novo_Teste', 'Novo_Desafio', 'Teste_Corrigido', 'Badge_Ganho', 'Aviso_Sistema']);
            $table->string('mensagem', 255);
            $table->unsignedBigInteger('id_teste')->nullable();
            $table->unsignedBigInteger('id_desafio')->nullable();
            $table->boolean('lida')->default(false);
            $table->timestamps();

            $table->foreign('id_utilizador')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_teste')->references('id')->on('Testes')->onDelete('set null');
            $table->foreign('id_desafio')->references('id')->on('Desafios')->onDelete('set null');
        });

        Schema::create('Historico_Atividades', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_aluno');
            $table->enum('tipo_atividade', ['Desafio_Concluido', 'Teste_Finalizado', 'Badge_Manual_Recebido']);
            $table->unsignedBigInteger('id_referencia')->nullable();
            $table->string('descricao', 255);
            $table->integer('xp_ganho')->default(0);
            $table->unsignedBigInteger('id_badge_ganho')->nullable();
            $table->timestamp('data_registo')->useCurrent();
            $table->timestamps();

            $table->foreign('id_aluno')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_badge_ganho')->references('id')->on('Badges')->onDelete('set null');
        });
    }

    public function down(): void
    {
        // Tem de ser destruído de baixo para cima devido às foreign keys
        Schema::dropIfExists('Historico_Atividades');
        Schema::dropIfExists('Notificacoes');
        Schema::dropIfExists('Inventario_Badges');
        Schema::dropIfExists('Inscricoes_Desafios');
        Schema::dropIfExists('Regras_Recompensa_Desafio');
        Schema::dropIfExists('Desafios_Atribuicoes');
        Schema::dropIfExists('Desafios_Perguntas');
        Schema::dropIfExists('Desafios');
        Schema::dropIfExists('Respostas_Alunos');
        Schema::dropIfExists('Testes_Realizados');
        Schema::dropIfExists('Testes_Atribuicoes');
        Schema::dropIfExists('Testes_Perguntas');
        Schema::dropIfExists('Opcoes_Pergunta');
        Schema::dropIfExists('Testes');
        Schema::dropIfExists('Perguntas');
        Schema::dropIfExists('Seguidores');
        Schema::dropIfExists('Grupo_Alunos');
        Schema::dropIfExists('Grupos');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::dropIfExists('Roles_Permissoes');
        Schema::dropIfExists('Categorias');
        Schema::dropIfExists('Permissoes');
        Schema::dropIfExists('Roles');
        Schema::dropIfExists('Niveis');
        Schema::dropIfExists('Turmas');
        Schema::dropIfExists('Badges');
    }
};
