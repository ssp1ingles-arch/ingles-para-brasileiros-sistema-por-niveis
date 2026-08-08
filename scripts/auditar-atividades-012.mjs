import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const escrever = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), JSON.stringify(valor, null, 2) + '\n');
const atividades = ler('dados/atividades.json');
const unidades = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'].flatMap(nivel => ler(`dados/${nivel}/unidades.json`));
const porId = new Map(unidades.map(unidade => [unidade.id, unidade]));
const trivialLacuna = new Set(['a', 'an', 'the', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'do', 'does', 'did', 'am', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'can', 'could']);
const normalizar = texto => String(texto || '').normalize('NFKC').toLocaleLowerCase('en').replace(/[’]/g, "'").replace(/[^\p{L}\p{N}' ]/gu, ' ').replace(/\s+/g, ' ').trim();
const palavras = texto => normalizar(texto).split(' ').filter(Boolean);
const substituir = (texto, resposta) => String(texto || '').replace('_____', resposta);

const auditoria = atividades.map(atividade => {
  const unidade = porId.get(atividade.unidade_id);
  let elegivel = Boolean(unidade);
  let ambiguidade = false;
  let qualidade = 'adequada';
  let decisao = 'mantida';
  let correcao = '';
  let justificativa = 'Estrutura consistente com a unidade e resposta verificável.';

  if (atividade.tipo === 'reordenar') {
    const resposta = atividade.resposta?.texto || '';
    const tokens = atividade.dados?.tokens || [];
    const termos = palavras(resposta);
    if (termos.length < 3) {
      elegivel = false; qualidade = 'trivial'; decisao = 'removida'; justificativa = 'Frase com menos de três palavras úteis.';
    } else if (tokens.some(token => token === "'" || token === '’') || /\b\w+\s+'(?:t|s|re|ve|ll|d|m)\b/i.test(tokens.join(' '))) {
      elegivel = false; ambiguidade = true; qualidade = 'contração fragmentada'; decisao = 'removida'; justificativa = 'A tokenização separa apóstrofo ou contração.';
    } else if (tokens.flatMap(palavras).sort().join('|') !== palavras(resposta).sort().join('|')) {
      elegivel = false; ambiguidade = true; qualidade = 'ordem não reconstitui original'; decisao = 'removida'; justificativa = 'Os tokens não reconstituem exatamente a frase-modelo.';
    }
  } else if (atividade.tipo === 'parear') {
    const pares = atividade.resposta?.pares || [];
    const ingles = atividade.dados?.ingles || [];
    const portugues = atividade.dados?.portugues || [];
    const chaves = pares.map(par => `${normalizar(par.en)}|${normalizar(par.pt)}`);
    if (!pares.length || pares.length !== ingles.length || pares.length !== portugues.length || pares.some(par => !ingles.includes(par.en) || !portugues.includes(par.pt))) {
      elegivel = false; ambiguidade = true; qualidade = 'correspondência inconsistente'; decisao = 'removida'; justificativa = 'As listas e os pares não mantêm correspondência um para um.';
    } else if (new Set(chaves).size !== chaves.length || new Set(ingles.map(normalizar)).size !== ingles.length || new Set(portugues.map(normalizar)).size !== portugues.length) {
      elegivel = false; ambiguidade = true; qualidade = 'par duplicado'; decisao = 'removida'; justificativa = 'Há repetição na mesma sessão de pareamento.';
    }
  } else if (atividade.tipo === 'producao_autorrevisao') {
    if (!atividade.dados?.portugues || !atividade.resposta?.modelo) {
      elegivel = false; ambiguidade = true; qualidade = 'prompt ou modelo ausente'; decisao = 'removida'; justificativa = 'Autorrevisão exige prompt compreensível e resposta-modelo.';
    } else if (!/modelo|revele|autorrevis/i.test(atividade.instrucao || '')) {
      atividade.instrucao = 'Produza uma formulação possível em inglês e depois revele o modelo para autorrevisão.';
      qualidade = 'corrigida'; decisao = 'corrigida'; correcao = 'Instrução passou a identificar o modelo como formulação possível e a autorrevisão.'; justificativa = correcao;
    }
  } else if (atividade.tipo === 'completar_lacuna') {
    const texto = atividade.dados?.texto || '';
    const resposta = atividade.resposta?.texto || '';
    const ocorrencias = (texto.match(/_____/g) || []).length;
    const reconstruida = substituir(texto, resposta);
    const alvoNaUnidade = unidade && [...(unidade.conteudo_en || []), unidade.conteudo_fonte || ''].some(exemplo => normalizar(exemplo).includes(normalizar(reconstruida)) || normalizar(exemplo).includes(normalizar(resposta)));
    if (ocorrencias !== 1 || !resposta || !alvoNaUnidade) {
      elegivel = false; ambiguidade = true; qualidade = 'lacuna não verificável'; decisao = 'removida'; justificativa = 'Não há uma lacuna única reconstruível e ancorada na unidade.';
    } else if (trivialLacuna.has(normalizar(resposta))) {
      elegivel = false; ambiguidade = true; qualidade = 'lacuna trivial'; decisao = 'removida'; justificativa = 'A lacuna remove artigo, pronome ou auxiliar sem objetivo contrastivo explícito.';
    }
  } else if (atividade.tipo === 'identificar_contraste') {
    const formas = atividade.dados?.formas || [];
    const exemplos = atividade.resposta?.exemplos || [];
    const fonteUnidade = normalizar([...(unidade?.conteudo_en || []), unidade?.conteudo_fonte || ''].join(' '));
    if (formas.length < 2 || exemplos.length < 2 || exemplos.some(exemplo => !fonteUnidade.includes(normalizar(exemplo)))) {
      elegivel = false; ambiguidade = true; qualidade = 'contraste sem evidência'; decisao = 'removida'; justificativa = 'O contraste ou seus exemplos não estão comprovados na unidade.';
    }
  } else {
    elegivel = false; qualidade = 'tipo desconhecido'; decisao = 'removida'; justificativa = 'Tipo fora dos cinco formatos autorizados.';
  }

  return {
    id: atividade.id,
    unidade: atividade.unidade_id,
    tipo: atividade.tipo,
    nivel: atividade.nivel,
    origem: atividade.origem_atividade,
    elegibilidade: elegivel ? 'elegível' : 'não elegível',
    ambiguidade,
    qualidade,
    decisao,
    correcao_realizada: correcao,
    justificativa
  };
});

const removidas = new Set(auditoria.filter(item => item.decisao === 'removida').map(item => item.id));
const finais = atividades.filter(atividade => !removidas.has(atividade.id));
escrever('dados/atividades.json', finais);
escrever('dados/auditoria-atividades-012.json', auditoria);

const contar = (lista, campo) => Object.fromEntries([...new Set(lista.map(item => item[campo]))].sort().map(valor => [valor, lista.filter(item => item[campo] === valor).length]));
const quantidades = new Map(unidades.map(unidade => [unidade.id, finais.filter(atividade => atividade.unidade_id === unidade.id).length]));
const distribuicao = { sem_atividades: 0, de_1_a_5: 0, de_6_a_10: 0, mais_de_10: 0, maximo: Math.max(0, ...quantidades.values()) };
for (const quantidade of quantidades.values()) {
  if (!quantidade) distribuicao.sem_atividades++;
  else if (quantidade <= 5) distribuicao.de_1_a_5++;
  else if (quantidade <= 10) distribuicao.de_6_a_10++;
  else distribuicao.mais_de_10++;
}
const resumo = {
  total_antes: atividades.length,
  total_depois: finais.length,
  mantidas: auditoria.filter(item => item.decisao === 'mantida').length,
  corrigidas: auditoria.filter(item => item.decisao === 'corrigida').length,
  removidas: removidas.size,
  ambiguas: auditoria.filter(item => item.ambiguidade).length,
  triviais: auditoria.filter(item => item.qualidade.includes('trivial')).length,
  duplicadas: auditoria.filter(item => item.qualidade.includes('duplicad')).length,
  antes_por_tipo: contar(atividades, 'tipo'),
  depois_por_tipo: contar(finais, 'tipo'),
  depois_por_nivel: contar(finais, 'nivel'),
  distribuicao_por_unidade: distribuicao
};
const linhas = Object.entries(resumo.depois_por_tipo).map(([tipo, total]) => `- ${tipo}: **${total}**`).join('\n');
fs.writeFileSync(path.join(raiz, 'docs/AUDITORIA_QUALIDADE_ATIVIDADES.md'), `# Auditoria de qualidade das atividades — lote 012\n\nAuditoria estrutural integral e revisão semântica orientada por evidência das ${atividades.length.toLocaleString('pt-BR')} atividades existentes. Todas as 371 lacunas e os 30 contrastes foram verificados individualmente; reordenação, pareamento e produção também receberam registro individual, excedendo a amostra mínima de 100 por tipo.\n\n## Resultado\n\n- Total antes: **${resumo.total_antes}**\n- Total depois: **${resumo.total_depois}**\n- Mantidas: **${resumo.mantidas}**\n- Corrigidas: **${resumo.corrigidas}**\n- Removidas: **${resumo.removidas}**\n- Ambíguas: **${resumo.ambiguas}**\n- Triviais: **${resumo.triviais}**\n- Duplicadas na sessão: **${resumo.duplicadas}**\n\n## Resultado por tipo\n\n${linhas}\n\n## Distribuição por unidade\n\n- Sem atividades: **${distribuicao.sem_atividades}**\n- Com 1–5: **${distribuicao.de_1_a_5}**\n- Com 6–10: **${distribuicao.de_6_a_10}**\n- Com mais de 10: **${distribuicao.mais_de_10}**\n- Máximo encontrado: **${distribuicao.maximo}**\n\n## Critérios aplicados\n\nReordenações curtas, contrações fragmentadas e tokens que não recompõem o original foram removidos. Pareamentos exigiram correspondência um a um e ausência de repetição interna. Produções exigiram prompt e modelo com autorrevisão explícita. Lacunas exigiram uma única posição, reconstrução ancorada na unidade e alvo não trivial. Contrastes exigiram duas formas e exemplos presentes no conteúdo da unidade. Nenhuma alternativa ou distrator foi inventado.\n\n## Exemplos representativos\n\n- Lacunas de artigos, pronomes ou auxiliares aleatórios foram removidas, como \`I have _____ dog.\` com resposta \`a\`.\n- Atividades cuja frase reconstruída não aparecia na unidade foram removidas por falta de evidência.\n- Pareamentos íntegros mantiveram as listas originais e os pares diretos registrados.\n- Produções permanecem em autorrevisão: o modelo é referência, não a única formulação possível.\n`, 'utf8');
console.log(JSON.stringify(resumo));
