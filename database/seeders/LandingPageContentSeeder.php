<?php

namespace Database\Seeders;

use App\Models\LandingPageContent;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LandingPageContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
            LandingPageContent::create([
        'conteudo' => [
            'slides' => [
                ['id' => 1, 'titulo' => 'Realizar Testes e Desafios Online', 'subtitulo' => 'A plataforma ideal para consolidar conhecimentos em qualquer disciplina.'],
                ['id' => 2, 'titulo' => 'Criar Testes e Desafios', 'subtitulo' => 'Usar o ProGama para avaliar e testar os conhecimentos dos alunos'],
                ['id' => 3, 'titulo' => 'A Nossa Mascote: Tico', 'subtitulo' => 'A mascote do ProGama chama-se Tico, e ele vai-se tornar o teu melhor amigo'],
            ],
            'informacoes' => [
                'titulo'    => 'Características do ProGama?',
                'subtitulo' => 'A plataforma ProGama foi preparada para fins escolares para ser utilizada por professores e alunos.',
                'professor' => ['titulo' => 'Professor', 'descricao' => 'Pode criar e gerir testes e desafios para atribui-los aos alunos.'],
                'aluno'     => ['titulo' => 'Aluno', 'descricao' => 'Tem de resolver os testes e desafios que lhe são propostos, e pode ganhar pontos e subir de nível.'],
            ],
            'desafios' => [
                'titulo'    => 'Características dos Desafios no ProGama',
                'subtitulo' => 'Os Desafios são missões interativas criadas pelo professor para o aluno.',
                'professor' => ['titulo' => 'Desafiante', 'lista' => ['Criar desafios de lógica personalizados', 'Definir recompensas e níveis']],
                'aluno'     => ['titulo' => 'Desafiador', 'lista' => ['Subir no ranking global', 'Ganhar medalhas exclusivas', 'Aprender através do jogo']],
                'niveis'    => [
                    ['id' => 1, 'nome' => 'Iniciante',     'emoji' => '🌱', 'req' => 'Foca-se em conceitos fundamentais, vocabulário básico e identificação de elementos principais através de exercícios de escolha múltipla.'],
                    ['id' => 2, 'nome' => 'Estudante',     'emoji' => '📚', 'req' => 'Requer a resolução de problemas intermédios e exercícios de interpretação que ligam diferentes temas da mesma disciplina.'],
                    ['id' => 3, 'nome' => 'Mestre',        'emoji' => '🏆', 'req' => 'Desafios que exigem a capacidade de síntese, resolução de casos complexos e aplicação de fórmulas ou regras gramaticais avançadas.'],
                    ['id' => 4, 'nome' => 'Grande Mestre', 'emoji' => '👑', 'req' => 'Reservado para alunos que dominam a matéria ao ponto de conseguirem resolver desafios interdisciplinares sob pressão de tempo.'],
                ],
                'resultados' => [
                    'vitoria' => ['status' => 'Ganhaste!', 'lista' => ['Sobes no Ranking', 'Ganhas medalhas']],
                    'derrota' => ['status' => 'Falhaste',  'lista' => ['Vês a correção imediata', 'Não ganhas pontos']],
                ],
            ],
            'testes' => [
                'titulo'    => 'Características Dos Testes Online',
                'subtitulo' => 'O sistema de testes do ProGama foi desenhado para oferecer uma avaliação precisa e dinâmica...',
                'professor' => ['titulo' => 'Criação e Gestão', 'lista' => ['Personalizar questões e limites de tempo', 'Gerar pautas de avaliação automáticas', 'Analisar estatísticas de desempenho da turma']],
                'aluno'     => ['titulo' => 'Prática e Revisão', 'lista' => ['Responder a testes com cronómetro real', 'Aceder a correções detalhadas na hora', 'Acompanhar a evolução das tuas notas']],
                'resultados' => [
                    'aprovado'  => ['status' => 'Aprovou',   'lista' => ['Nota superior a 50%', 'Professor e Aluno Recebem FeedBack']],
                    'reprovado' => ['status' => 'Reprovou',  'lista' => ['Professor e Aluno Recebem FeedBack', 'Analisar as correções do Tico']],
                ],
            ],
            'footer' => [
                'tagline'     => 'Agora com o ProGama tu divertes-te na escola.',
                'localizacao' => 'Porto, Portugal',
                'email'       => 'suporte@progama.pt',
            ],
        ]
    ]);
    }
}
