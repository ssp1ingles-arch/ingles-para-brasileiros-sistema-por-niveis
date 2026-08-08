import fs from 'node:fs';
import path from 'node:path';
const raiz = path.resolve(import.meta.dirname, '..');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const gravar = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), `${JSON.stringify(valor, null, 2)}\n`);
const unidades = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'].flatMap(nivel => ler(`dados/${nivel}/unidades.json`));
const atividades = ler('dados/atividades.json');
const agrupar = campo => Object.fromEntries([...new Set(unidades.map(item => item[campo]))].sort().map(valor => [valor, unidades.filter(item => item[campo] === valor).length]));
gravar('dados/matriz-curricular-029.json', { versao: '029', gerado_em: new Date().toISOString(), comparacao: { antes: { tratadas: 1246, pendentes: 301, cobertura: 80.54 }, depois: { tratadas: 1249, pendentes: 298, cobertura: 80.74 } }, unidades: unidades.length, atividades: atividades.length, subpaineis: ler('dados/subpaineis.json').length, por_nivel: agrupar('nivel'), por_habilidade: agrupar('habilidade_principal'), impacto: '1197 classificada como hub editorial; 1198 e 1199 consolidadas como extrações independentes de Grammar Guide e Vocabulary Builder.', lacunas_abertas: ler('dados/matriz-curricular-028.json').lacunas_abertas });

function bloco(arquivo, chave, texto) {
  const destino = path.join(raiz, arquivo);
  const inicio = `<!-- LOTE-029-${chave}:INICIO -->`;
  const fim = `<!-- LOTE-029-${chave}:FIM -->`;
  const conteudo = `${inicio}\n${texto}\n${fim}`;
  let atual = fs.readFileSync(destino, 'utf8').trim();
  if (atual.includes(inicio)) atual = atual.replace(new RegExp(`${inicio}[\\s\\S]*?${fim}`), conteudo);
  else atual += `\n\n${conteudo}`;
  fs.writeFileSync(destino, `${atual}\n`);
}

bloco('docs/DECISOES.md', 'DECISOES', '## Decisões do lote 029\n\n- Classificar 1197 como índice/hub editorial, sem conteúdo didático independente.\n- Consolidar os 36 temas e 191 itens de 1198 nos destinos já associados à fonte canônica 1189.\n- Consolidar os 14 temas de 1199 nos destinos da fonte canônica 1191 e registrar 150 itens reais contra 140 declarados no cabeçalho.\n- Classificar 1198 e 1199 como obras independentes, não duplicatas.\n- Encerrar antes de 1200.');
bloco('docs/MAPEAMENTO_FONTES_PARA_CONTEUDO.md', 'MAPEAMENTO', '## Lote 029 — mapeamento\n\n1197: índice/hub editorial com nove partes decididas e quatro referências de obras. 1198: 36 temas gramaticais e 191 itens consolidados por procedência da fonte 1189. 1199: 14 temas lexicais e 150 itens consolidados por procedência da fonte 1191; o cabeçalho declara incorretamente 140.');
bloco('docs/AUDITORIA_COBERTURA_CURRICULAR.md', 'COBERTURA', '## Atualização curricular — lote 029\n\nCobertura: 80,54% → 80,74%. Unidades, atividades, subpainéis, Jornada e localStorage permaneceram estáveis.');
bloco('docs/PROGRESSO.md', 'PROGRESSO', '## Lote 029\n\n- Sequenciais: 1197–1199; um hub editorial e duas fontes integralmente classificadas.\n- 1198 e 1199 são obras independentes; 1199 contém 150 itens verificáveis, apesar de declarar 140.\n- Totais preservados: 834 unidades, 1.977 atividades, 95 subpainéis, Jornada 806+28.\n- Última: `1199_livro02_3.md`; próxima: `1200_livro03_3.md`.');
console.log('Documentação 029 finalizada.');
