import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const gravar = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), `${JSON.stringify(valor, null, 2)}\n`);
const unidades = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'].flatMap(nivel => ler(`dados/${nivel}/unidades.json`));
const atividades = ler('dados/atividades.json');
const agrupar = campo => Object.fromEntries([...new Set(unidades.map(unidade => unidade[campo]))].sort().map(valor => [valor, unidades.filter(unidade => unidade[campo] === valor).length]));
gravar('dados/matriz-curricular-037.json', {versao: '037', gerado_em: new Date().toISOString(), comparacao: {antes: {tratadas: 1261, pendentes: 286, cobertura: 81.51}, depois: {tratadas: 1263, pendentes: 284, cobertura: 81.64}}, unidades: unidades.length, atividades: atividades.length, subpaineis: ler('dados/subpaineis.json').length, por_nivel: agrupar('nivel'), por_habilidade: agrupar('habilidade_principal'), impacto: '1217 foi confirmada como duplicata integral de 0144/0781; 1218 foi classificada como compilação integral dos blocos 1214–1217, sem conteúdo didático exclusivo.', lacunas_abertas: ler('dados/matriz-curricular-036.json').lacunas_abertas});
function bloco(arquivo, chave, texto) {
  const destino = path.join(raiz, arquivo), inicio = `<!-- LOTE-037-${chave}:INICIO -->`, fim = `<!-- LOTE-037-${chave}:FIM -->`, conteudo = `${inicio}\n${texto}\n${fim}`;
  let atual = fs.readFileSync(destino, 'utf8').trim();
  atual = atual.includes(inicio) ? atual.replace(new RegExp(`${inicio}[\\s\\S]*?${fim}`), conteudo) : `${atual}\n\n${conteudo}`;
  fs.writeFileSync(destino, `${atual}\n`);
}
bloco('docs/DECISOES.md', 'DECISOES', '## Decisões do lote 037\n\n- Ler 1217 integralmente e concluir a validação intermediária antes de abrir 1218.\n- Tratar 1217 como duplicata integral de 0144/0781 após igualdade do corpo e do hash normalizado.\n- Tratar 1218 como página agregadora dos quatro blocos 1214–1217, sem conteúdo didático exclusivo.\n- Consolidar somente procedências em destinos existentes; não criar unidades, atividades, painéis ou subpainéis.\n- Preservar integralmente interface, Jornada, IDs, ordens, progresso, revisão, retomada e localStorage; encerrar antes de 1219.');
bloco('docs/MAPEAMENTO_FONTES_PARA_CONTEUDO.md', 'MAPEAMENTO', '## Lote 037 — mapeamento\n\n1217 repete integralmente a fonte canônica 0144 e a duplicata 0781. A página 1218 agrega integralmente os conteúdos já classificados em 1214–1217. As procedências foram consolidadas em destinos existentes, sem republicação de páginas, tabelas, exemplos, traduções ou elementos de interface.');
bloco('docs/AUDITORIA_COBERTURA_CURRICULAR.md', 'COBERTURA', '## Atualização curricular — lote 037\n\nCobertura: 81,51% → 81,64%. As duas fontes foram decididas integralmente, sem alterar 834 unidades, 1.977 atividades, 95 subpainéis ou a Jornada 806+28.');
console.log('Documentação 037 finalizada.');
