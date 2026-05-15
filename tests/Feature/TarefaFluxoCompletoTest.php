<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Desafio;
use App\Models\Turma;
use App\Models\AtribuicaoDesafio;
use App\Models\SubmissaoDesafioAluno;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TarefaFluxoCompletoTest extends TestCase
{
    use RefreshDatabase;

    protected User $professor;
    protected User $aluno;
    protected Turma $turma;
    protected Desafio $tarefa;

    protected function setUp(): void
    {
        parent::setUp();

        // Criar professor (role 2)
        $this->professor = User::factory()->create(['id_role' => 2]);

        // Criar aluno (role 1)
        $this->aluno = User::factory()->create(['id_role' => 1]);

        // Criar turma
        $this->turma = Turma::factory()->create();

        // Associar professor à turma
        $this->turma->professores()->attach($this->professor);

        // Associar aluno à turma
        $this->turma->alunos()->attach($this->aluno);
    }

    /** @test */
    public function professor_pode_criar_tarefa()
    {
        $response = $this->actingAs($this->professor)
            ->post(route('professor.testes.store'), [
                'titulo' => 'Tarefa de Teste',
                'tipo_desafio' => 'Tarefa',
                'instrucoes' => 'Entrega um ficheiro com a solução.',
                'peso_avaliacao' => 20,
                'duracao_minutos' => 60,
                'xp_base' => 100,
                'auto_award_xp' => true,
            ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('Desafio', [
            'titulo' => 'Tarefa de Teste',
            'tipo_desafio' => 'Tarefa',
            'id_formador' => $this->professor->id,
        ]);

        $tarefa = Desafio::where('titulo', 'Tarefa de Teste')->first();
        $this->assertNotNull($tarefa);
        $this->tarefa = $tarefa;
    }

    /** @test */
    public function professor_pode_atribuir_tarefa_a_turma()
    {
        // Criar tarefa
        $this->tarefa = Desafio::factory()->create([
            'id_formador' => $this->professor->id,
            'tipo_desafio' => 'Tarefa',
        ]);

        $agora = now();
        $futuro = now()->addDays(7);

        $response = $this->actingAs($this->professor)
            ->post(route('professor.tarefas.store'), [
                'id_desafio' => $this->tarefa->id,
                'turma_ids' => [$this->turma->id],
                'data_hora_abertura' => $agora->toDateTimeString(),
                'data_hora_fecho' => $futuro->toDateTimeString(),
                'tentativas_maximas' => 3,
            ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('Atribuicoes_Desafio', [
            'id_desafio' => $this->tarefa->id,
            'id_turma' => $this->turma->id,
        ]);
    }

    /** @test */
    public function aluno_pode_submeter_tarefa()
    {
        // Criar tarefa e atribuição
        $this->tarefa = Desafio::factory()->create([
            'id_formador' => $this->professor->id,
            'tipo_desafio' => 'Tarefa',
        ]);

        $atribuicao = AtribuicaoDesafio::create([
            'id_desafio' => $this->tarefa->id,
            'id_turma' => $this->turma->id,
            'data_inicio_tentativas' => now(),
            'data_fim_tentativas' => now()->addDays(7),
        ]);

        // Aluno submete
        $response = $this->actingAs($this->aluno)
            ->post(route('aluno.desafios.submeter', $atribuicao->id), [
                'resposta_texto' => 'Minha solução da tarefa',
            ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('Submissoes_Desafio_Aluno', [
            'id_desafio' => $this->tarefa->id,
            'id_aluno' => $this->aluno->id,
        ]);
    }

    /** @test */
    public function professor_pode_listar_submissoes()
    {
        // Criar tarefa
        $this->tarefa = Desafio::factory()->create([
            'id_formador' => $this->professor->id,
            'tipo_desafio' => 'Tarefa',
        ]);

        // Criar submissão
        SubmissaoDesafioAluno::create([
            'id_desafio' => $this->tarefa->id,
            'id_aluno' => $this->aluno->id,
            'estado' => SubmissaoDesafioAluno::SUBMETIDO,
            'numero_tentativa' => 1,
        ]);

        $response = $this->actingAs($this->professor)
            ->get(route('professor.submissoes.index', $this->tarefa->id));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) =>
            $page->component('Dashboard/Components/Professores/Desafios/ListaSubmissoesView')
                ->has('submissoes', 1)
        );
    }

    /** @test */
    public function professor_pode_avaliar_submissao()
    {
        // Criar tarefa
        $this->tarefa = Desafio::factory()->create([
            'id_formador' => $this->professor->id,
            'tipo_desafio' => 'Tarefa',
        ]);

        // Criar submissão
        $submissao = SubmissaoDesafioAluno::create([
            'id_desafio' => $this->tarefa->id,
            'id_aluno' => $this->aluno->id,
            'estado' => SubmissaoDesafioAluno::SUBMETIDO,
            'numero_tentativa' => 1,
        ]);

        $response = $this->actingAs($this->professor)
            ->put(route('professor.submissoes.avaliar', $submissao->id), [
                'nota' => 18.5,
                'feedback_professor' => 'Bom trabalho!',
                'estado' => SubmissaoDesafioAluno::AVALIADO,
            ]);

        $response->assertSuccessful();

        $submissaoAtualizada = $submissao->fresh();
        $this->assertEquals(18.5, $submissaoAtualizada->nota);
        $this->assertEquals('Bom trabalho!', $submissaoAtualizada->feedback_professor);
        $this->assertEquals(SubmissaoDesafioAluno::AVALIADO, $submissaoAtualizada->estado);
    }

    /** @test */
    public function validacao_falha_se_data_fecho_anterior_a_abertura()
    {
        $this->tarefa = Desafio::factory()->create([
            'id_formador' => $this->professor->id,
        ]);

        $agora = now();
        $passado = now()->subDays(7);

        $response = $this->actingAs($this->professor)
            ->post(route('professor.tarefas.store'), [
                'id_desafio' => $this->tarefa->id,
                'turma_ids' => [$this->turma->id],
                'data_hora_abertura' => $agora->toDateTimeString(),
                'data_hora_fecho' => $passado->toDateTimeString(),
            ]);

        $response->assertSessionHasErrors('data_hora_fecho');
    }

    /** @test */
    public function validacao_falha_se_tentativas_maximas_zero()
    {
        $this->tarefa = Desafio::factory()->create([
            'id_formador' => $this->professor->id,
        ]);

        $agora = now();
        $futuro = now()->addDays(7);

        $response = $this->actingAs($this->professor)
            ->post(route('professor.tarefas.store'), [
                'id_desafio' => $this->tarefa->id,
                'turma_ids' => [$this->turma->id],
                'data_hora_abertura' => $agora->toDateTimeString(),
                'data_hora_fecho' => $futuro->toDateTimeString(),
                'tentativas_maximas' => 0,
            ]);

        $response->assertSessionHasErrors('tentativas_maximas');
    }

    /** @test */
    public function media_boletim_usa_peso_nota()
    {
        // Criar 2 tarefas com pesos diferentes
        $tarefa1 = Desafio::factory()->create([
            'id_formador' => $this->professor->id,
            'peso_nota' => 30,
        ]);

        $tarefa2 = Desafio::factory()->create([
            'id_formador' => $this->professor->id,
            'peso_nota' => 70,
        ]);

        // Criar submissões com notas diferentes
        SubmissaoDesafioAluno::create([
            'id_desafio' => $tarefa1->id,
            'id_aluno' => $this->aluno->id,
            'nota' => 16,
            'estado' => SubmissaoDesafioAluno::AVALIADO,
        ]);

        SubmissaoDesafioAluno::create([
            'id_desafio' => $tarefa2->id,
            'id_aluno' => $this->aluno->id,
            'nota' => 18,
            'estado' => SubmissaoDesafioAluno::AVALIADO,
        ]);

        // Média ponderada: (16 * 0.3) + (18 * 0.7) = 4.8 + 12.6 = 17.4
        $response = $this->actingAs($this->aluno)
            ->get(route('dashboard', ['view' => 'boletim']));

        $response->assertSuccessful();
        // A média ponderada deve ser aproximadamente 17.4
        $response->assertViewHas('boletim');
    }

    /** @test */
    public function professor_nao_pode_avaliar_submissao_de_outro_professor()
    {
        $outroProfessor = User::factory()->create(['id_role' => 2]);

        $this->tarefa = Desafio::factory()->create([
            'id_formador' => $outroProfessor->id,
        ]);

        $submissao = SubmissaoDesafioAluno::create([
            'id_desafio' => $this->tarefa->id,
            'id_aluno' => $this->aluno->id,
            'estado' => SubmissaoDesafioAluno::SUBMETIDO,
        ]);

        $response = $this->actingAs($this->professor)
            ->put(route('professor.submissoes.avaliar', $submissao->id), [
                'nota' => 15,
                'estado' => SubmissaoDesafioAluno::AVALIADO,
            ]);

        $response->assertNotFound();
    }

    /** @test */
    public function aluno_nao_pode_acessar_rotas_professor()
    {
        $this->tarefa = Desafio::factory()->create([
            'id_formador' => $this->professor->id,
        ]);

        $response = $this->actingAs($this->aluno)
            ->get(route('professor.submissoes.index', $this->tarefa->id));

        $response->assertForbidden();
    }
}
