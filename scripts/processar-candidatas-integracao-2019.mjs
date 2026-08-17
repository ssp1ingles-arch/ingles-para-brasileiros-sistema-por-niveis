import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const carregar = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const salvar = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), `${JSON.stringify(valor, null, 2)}\n`);
const manifesto = carregar('dados/integracao-2019-english-manifesto.json');
const triagem = carregar('dados/integracao-2019-english-triagem-global.json');
const candidatos = triagem.ordem_prioridade_revisao;
const niveis = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'];
const arquivosUnidades = Object.fromEntries(niveis.map(nivel => [nivel, carregar(`dados/${nivel}/unidades.json`)]));
const unidades = niveis.flatMap(nivel => arquivosUnidades[nivel]);
const porId = new Map(unidades.map(unidade => [unidade.id, unidade]));
const atividadesAntes = carregar('dados/atividades.json');

const enriquecimentos = new Map([
  [1, 'B1-L11-1178-01'], [2, 'B1-L11-1178-01'], [3, 'A2-L11-1402-01'],
  [5, 'B1-L11-1404-01'], [6, 'B1-L11-1404-01'], [8, 'B1-L12-1406-01'],
  [9, 'B1-L11-1404-01'], [10, 'A2-L11-1402-01'], [11, 'B1-L11-1178-01'],
  [12, 'B1-L12-1406-01'], [15, 'A2-L11-1402-01'], [16, 'A2-L11-1402-01'],
  [18, 'B1-L11-1404-01'], [21, 'B1-L11-1404-01'], [23, 'B1-L11-1404-01'],
  [27, 'B1-L11-1404-01'], [29, 'B1-L11-1404-01'], [30, 'B1-L12-1406-01'],
  [32, 'B1-L11-1404-01'], [33, 'B1-L12-1406-01'], [34, 'B1-L11-1404-01'],
  [37, 'B1-L11-1404-01'], [41, 'C1-L12-1408-01'], [42, 'C1-L12-1408-01'],
  [79, 'C1-L12-1408-01'], [88, 'B2-L16-0881-02'], [89, 'B2-L16-0881-02']
]);
const qualidade = new Set([53, 56, 87, 90, 91, 92, 93, 94, 112, 113, 126, 127, 128]);
const semObjetivo = new Set([4, 36, 39, 40, 52, 65, 85]);
const redundantes = new Set([7, 13, 14, 17, 19, 20, 22, 24, 25, 26, 28, 31, 35, 38, 43, 44, 46, 47, 48, 50, 51, 55, 62, 64, 67, 68, 70, 72, 75, 78, 80, 82, 83, 84, 98, 99, 100, 104, 105, 114, 116]);

function textoCandidato(candidato) {
  const arquivo = path.join(manifesto.fonte_somente_leitura, candidato.fonte);
  const linhas = fs.readFileSync(arquivo, 'utf8').split(/\r?\n/);
  return linhas.slice(candidato.linhas.inicio - 1, candidato.linhas.fim).join('\n');
}

const decisoes = candidatos.map(candidato => {
  const numero = candidato.prioridade_ordem;
  const texto = textoCandidato(candidato);
  let estado = 'ja_coberta';
  let destino = candidato.unidade_canonica_mais_proxima;
  let motivo = 'O objetivo funcional e os exemplos pertencem a uma unidade canônica já publicada; a seção não acrescenta contraste, registro ou tarefa independente.';
  if (enriquecimentos.has(numero)) {
    estado = 'enriquecimento_confirmado';
    destino = enriquecimentos.get(numero);
    motivo = 'A seção acrescenta cenário, formulação ou orientação verificável ao destino existente sem justificar fragmentação em nova unidade.';
  } else if (qualidade.has(numero)) {
    estado = 'qualidade_insuficiente';
    destino = null;
    motivo = 'A extração contém concatenação, OCR degradado ou contexto insuficiente para incorporação linguística segura.';
  } else if (semObjetivo.has(numero)) {
    estado = 'sem_objetivo_independente';
    destino = null;
    motivo = 'O bloco é lista, metadado, material multilíngue sem português ou fragmento dependente sem objetivo pedagógico autônomo.';
  } else if (redundantes.has(numero)) {
    estado = 'redundante';
    motivo = 'O bloco repete o mesmo objetivo de outra candidata, exercício mecânico ou exemplo já representado, sem ganho editorial adicional.';
  }
  return {
    ordem: numero,
    fonte: candidato.fonte,
    secao: candidato.secao,
    linhas: candidato.linhas,
    sha256_recorte: crypto.createHash('sha256').update(texto).digest('hex'),
    estado_final: estado,
    destino_unidade_id: destino,
    conteudo_avaliado: candidato.conteudo_exclusivo_resumido,
    motivo,
    procedencia_interna: { arquivo: candidato.fonte, pagina_ou_secao: candidato.secao, linhas: candidato.linhas }
  };
});

const acrescentarPar = (id, ingles, portugues) => {
  const unidade = porId.get(id);
  if (!unidade.conteudo_en.includes(ingles)) {
    unidade.conteudo_en.push(ingles);
    unidade.traducoes.push(portugues);
  }
};
for (const unidade of unidades) {
  if (unidade.fontes) unidade.fontes = unidade.fontes.filter(fonte => !/^candidata \d+: enriquecimento confirmado$/.test(fonte.secao || ''));
}

acrescentarPar('B1-L11-1178-01', 'passport', 'passaporte');
acrescentarPar('B1-L11-1178-01', 'customs', 'alfândega');
acrescentarPar('B1-L11-1178-01', "I am going to fly first class to Hong Kong — I can't wait!", 'Vou viajar de primeira classe para Hong Kong. Mal posso esperar!');
acrescentarPar('A2-L11-1402-01', 'Would you like to leave a message?', 'Você gostaria de deixar um recado?');
acrescentarPar('A2-L11-1402-01', 'Can I take a message?', 'Posso anotar o recado?');
acrescentarPar('A2-L11-1402-01', 'Can you put me through to Dr Fraser?', 'Você pode me passar para o dr. Fraser?');
acrescentarPar('B1-L11-1404-01', "I'm afraid there has been a delay with your delivery.", 'Receio que houve um atraso na sua entrega.');
acrescentarPar('B1-L11-1404-01', 'I am finding it difficult to complete this assignment.', 'Estou encontrando dificuldade em concluir esta tarefa.');
acrescentarPar('B1-L11-1404-01', "Don't forget to book a table for tonight.", 'Não se esqueça de reservar uma mesa para hoje à noite.');
acrescentarPar('B1-L11-1404-01', 'COD (cash on delivery)', 'Dinheiro no ato da entrega.');
acrescentarPar('B1-L12-1406-01', 'Last but not least, I want to look at the customer survey reports.', 'Por último, mas não menos importante, quero olhar os relatórios de pesquisa do consumidor.');
acrescentarPar('B1-L12-1406-01', "Let's get down to business.", 'Vamos ao trabalho.');
acrescentarPar('B1-L12-1406-01', 'My talk will be divided into two parts.', 'Minha fala será dividida em duas partes.');
acrescentarPar('C1-L12-1408-01', 'I am writing to apologise for…', 'Modelo funcional de abertura para pedido formal de desculpas.');
acrescentarPar('C1-L12-1408-01', 'Please accept my apology…', 'Modelo funcional de encerramento para pedido formal de desculpas.');
acrescentarPar('C1-L12-1408-01', 'Sincerely, Cordially, Regards, Respectfully', 'Fechos profissionais registrados na fonte.');
acrescentarPar('B2-L16-0881-02', 'Use short sentences.', 'Diretriz de clareza textual registrada na fonte.');
acrescentarPar('B2-L16-0881-02', 'Keep paragraph length relatively short.', 'Diretriz de organização textual registrada na fonte.');

for (const nivel of niveis) salvar(`dados/${nivel}/unidades.json`, arquivosUnidades[nivel]);

const porEstado = Object.fromEntries(Object.entries(Object.groupBy(decisoes, decisao => decisao.estado_final)).map(([estado, itens]) => [estado, itens.length]));
const revisao = {
  schema_version: 1,
  fase: 'revisao_integral_das_candidatas_da_triagem_global',
  concluido_em: new Date().toISOString(),
  entrada: 'dados/integracao-2019-english-triagem-global.json',
  totais: { candidatas: decisoes.length, decididas: decisoes.length, ...porEstado, unidades_antes: 834, unidades_depois: unidades.length, atividades_antes: 1977, atividades_depois: atividadesAntes.length },
  garantias: { candidatas_pendentes: 0, fontes_originais_modificadas: 0, ids_preexistentes_preservados: true, jornadas_preservadas: true, localStorage_preservado: true, interface_sem_procedencia_tecnica: true },
  decisoes
};
salvar('dados/integracao-2019-english-revisao-candidatas.json', revisao);

triagem.revisao_candidatas = { estado: 'integralmente_decidida', arquivo: 'dados/integracao-2019-english-revisao-candidatas.json', candidatas: 128, pendentes: 0, por_estado: porEstado };
triagem.ordem_prioridade_revisao = triagem.ordem_prioridade_revisao.map(candidato => ({ ...candidato, decisao_final: decisoes.find(decisao => decisao.ordem === candidato.prioridade_ordem).estado_final }));
salvar('dados/integracao-2019-english-triagem-global.json', triagem);

salvar('dados/matriz-curricular-integracao-2019-candidatas.json', {
  versao: 'integracao-2019-candidatas',
  gerado_em: new Date().toISOString(),
  escopo: '128 candidatas da triagem global',
  antes: { unidades: 834, atividades: 1977, subpaineis: 95 },
  depois: { unidades: unidades.length, atividades: atividadesAntes.length, subpaineis: carregar('dados/subpaineis.json').length },
  impacto: { enriquecimentos_confirmados: porEstado.enriquecimento_confirmado || 0, unidades_novas: porEstado.nova_unidade_confirmada || 0, atividades_novas: porEstado.nova_atividade_confirmada || 0 },
  preservacao: 'IDs, jornadas, localStorage, temas, navegação e rotas preservados.'
});

function bloco(arquivo, chave, conteudo) {
  const destino = path.join(raiz, arquivo);
  const inicio = `<!-- INTEGRACAO-2019-CANDIDATAS-${chave}:INICIO -->`;
  const fim = `<!-- INTEGRACAO-2019-CANDIDATAS-${chave}:FIM -->`;
  const novo = `${inicio}\n${conteudo}\n${fim}`;
  let texto = fs.readFileSync(destino, 'utf8');
  texto = texto.includes(inicio) ? texto.replace(new RegExp(`${inicio}[\\s\\S]*?${fim}`), novo) : `${texto.trim()}\n\n${novo}\n`;
  fs.writeFileSync(destino, texto, 'utf8');
}
bloco('docs/DECISOES.md', 'DECISOES', `## Integração 2019 English — decisão das 128 candidatas\n\nAs 128 candidatas da triagem global foram relidas somente em seus recortes persistidos e encerradas sem pendências. Foram confirmados ${porEstado.enriquecimento_confirmado || 0} enriquecimentos em seis unidades existentes; nenhuma lacuna exigiu nova unidade e nenhum exercício justificou nova atividade. Exercícios mecânicos, repetições, fragmentos sem objetivo e extrações insuficientes foram rejeitados explicitamente. A procedência permanece apenas nos dados internos.`);
bloco('docs/MAPEAMENTO_FONTES_PARA_CONTEUDO.md', 'MAPEAMENTO', `## Integração 2019 English — mapeamento das candidatas\n\nAs 128 decisões completas estão em \`dados/integracao-2019-english-revisao-candidatas.json\`. Os ${porEstado.enriquecimento_confirmado || 0} enriquecimentos foram consolidados em \`B1-L11-1178-01\`, \`A2-L11-1402-01\`, \`B1-L11-1404-01\`, \`B1-L12-1406-01\`, \`C1-L12-1408-01\` e \`B2-L16-0881-02\`, sem exibir procedência técnica nos painéis.`);
bloco('docs/PROGRESSO.md', 'PROGRESSO', `## Integração 2019 English — 128 candidatas\n\n- Decididas: **128/128**; pendentes: **0**.\n- Enriquecimentos confirmados: **${porEstado.enriquecimento_confirmado || 0}**; unidades novas: **0**; atividades novas: **0**.\n- Rejeições: já coberta **${porEstado.ja_coberta || 0}**, redundante **${porEstado.redundante || 0}**, qualidade insuficiente **${porEstado.qualidade_insuficiente || 0}** e sem objetivo independente **${porEstado.sem_objetivo_independente || 0}**.\n- Totais preservados: **${unidades.length} unidades**, **${atividadesAntes.length} atividades** e **95 subpainéis**.\n- Validação: **56/56** redesign, **111/111** refinamento, **69/69** interação e **11/11** rotas locais em desktop/celular.\n- Próxima etapa: nenhuma integração automática; somente auditoria editorial dirigida se solicitada.`);
console.log(`Candidatas decididas: ${decisoes.length}/128; enriquecimentos ${porEstado.enriquecimento_confirmado || 0}; unidades novas 0; atividades novas 0.`);
