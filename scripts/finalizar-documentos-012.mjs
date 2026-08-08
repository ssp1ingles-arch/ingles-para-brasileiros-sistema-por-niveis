import fs from 'node:fs';
import path from 'node:path';
const raiz = path.resolve(import.meta.dirname, '..');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const escrever = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), JSON.stringify(valor, null, 2) + '\n');
const triagem = ler('dados/lote-012-triagem.json');
const auditoria = ler('dados/auditoria-atividades-012.json');
const atividades = ler('dados/atividades.json');
const unidades = ['a1','a2','b1','b2','c1','c2','kids'].flatMap(n => ler(`dados/${n}/unidades.json`));
const antes = 751, novas = unidades.length - antes;
const status = lista => Object.fromEntries([...new Set(lista.map(x=>x.status))].sort().map(s=>[s,lista.filter(x=>x.status===s).length]));
const seq = status(triagem.sequenciais), dir = status(triagem.direcionadas);
const removidasPorTipo = Object.fromEntries([...new Set(auditoria.map(x=>x.tipo))].sort().map(t=>[t,auditoria.filter(x=>x.tipo===t&&x.decisao==='removida').length]));
const quantidades = unidades.map(u => atividades.filter(a=>a.unidade_id===u.id).length);
const dist = { sem: quantidades.filter(n=>n===0).length, umCinco: quantidades.filter(n=>n>=1&&n<=5).length, seisDez: quantidades.filter(n=>n>=6&&n<=10).length, maisDez: quantidades.filter(n=>n>10).length, maximo: Math.max(...quantidades) };
const bloco = `<!-- LOTE-012:INICIO -->
## Lote 012

- Sequenciais: **60** (\`0541\`–\`0600\`), com ${Object.entries(seq).map(([k,v])=>`${v} ${k}`).join(', ')}.
- Amostragem dirigida: **17 fontes canônicas** — cinco Kids/N6, cinco C1/C2/N5, cinco textos/diálogos/transcrições e duas adicionais de inglês profissional.
- Unidades novas: **${novas}**; total **${unidades.length}**. Kids foi ativado com cinco unidades e CEFR explícito; C2 foi ativado com duas unidades e justificativa de proficiência.
- Atividades: **2.319 → ${atividades.length}**. Removidas por tipo: ${Object.entries(removidasPorTipo).map(([k,v])=>`${k} ${v}`).join('; ')}. Nenhuma lacuna trivial permaneceu.
- Distribuição final por unidade: sem atividades **${dist.sem}**; 1–5 **${dist.umCinco}**; 6–10 **${dist.seisDez}**; mais de 10 **${dist.maisDez}**; máximo **${dist.maximo}**.
- Rotas: **11/11** com HTTP 200, título, desktop/celular e console sem erros.
- Jornada: todos os IDs anteriores preservados; C2 e Kids receberam jornada apenas após conteúdo legítimo.
- Última fonte sequencial: \`0600_KNOW_Sentido_01_SABER.md\`; próxima: \`0601_KNOW_Sentido_02_CONHECER.md\`.
<!-- LOTE-012:FIM -->`;
const progressoPath = path.join(raiz,'docs/PROGRESSO.md');
let progresso = fs.readFileSync(progressoPath,'utf8').replace('Atualizado em 2026-08-08 após o lote 011.','Atualizado em 2026-08-08 após o lote 012.');
const rx = /(?:<!-- LOTE-012:INICIO -->[\s\S]*?<!-- LOTE-012:FIM -->\s*)?/;
if (progresso.includes('<!-- LOTE-012:INICIO -->')) progresso = progresso.replace(/<!-- LOTE-012:INICIO -->[\s\S]*?<!-- LOTE-012:FIM -->/,bloco);
else progresso = progresso.replace('\n## Lote 006',`\n${bloco}\n\n## Lote 006`);
fs.writeFileSync(progressoPath,progresso,'utf8');

function atualizarDoc(arquivo, titulo, conteudo) {
  const p=path.join(raiz,arquivo), inicio=`<!-- LOTE-012-${titulo}:INICIO -->`, fim=`<!-- LOTE-012-${titulo}:FIM -->`, bloco=`${inicio}\n${conteudo}\n${fim}`;
  let texto=fs.readFileSync(p,'utf8');
  texto=texto.includes(inicio)?texto.replace(new RegExp(`${inicio}[\\s\\S]*?${fim}`),bloco):`${texto.trim()}\n\n${bloco}\n`;
  fs.writeFileSync(p,texto,'utf8');
}
atualizarDoc('docs/MAPEAMENTO_FONTES_PARA_CONTEUDO.md','MAPEAMENTO',`## Lote 012 — mapeamento\n\nA triagem completa está em \`dados/lote-012-triagem.json\`. As fontes 0541–0600 foram lidas e mapeadas por hash, canônica, duplicidade, ação e justificativa. A fonte 0541 foi consolidada na canônica 0179, sem nova unidade. As 17 dirigidas têm destinos explícitos em Kids, C1/C2, Escuta/Leitura e Inglês profissional. Fontes com OCR insuficiente (0583, 0585 e 0587) permanecem parciais e não publicadas.`);
atualizarDoc('docs/DECISOES.md','DECISOES',`## Decisões do lote 012\n\n- Não criar unidade isolada para \`have dinner\`: 0541 é duplicata normalizada de 0179.\n- Remover todas as 371 lacunas: o gerador anterior retirava apenas \`a/an/do/does/did\`, sem alvo inequívoco relevante.\n- Não inventar alternativas; quatro pareamentos duplicados e duas reordenações inconsistentes foram removidos.\n- Ativar Kids somente com material explicitamente infantil e \`nivel_cefr\`.\n- Ativar C2 apenas para transferência de registro, estilo, reformulação e idiomaticidade comprovadas.\n- Manter três OCRs corrompidos como parciais, sem forçar publicação.`);
atualizarDoc('docs/AUDITORIA_COBERTURA_CURRICULAR.md','COBERTURA',`## Atualização curricular — lote 012\n\nLacunas reduzidas: Kids passou de 0 para 5 unidades; C2 de 0 para 2; Escuta, Leitura, Escrita e Inglês profissional receberam novas fontes. Permanecem abertas: maior variedade de produção escrita, leitura longa, prática profissional e expansão responsável de C2/Kids. A matriz detalhada está em \`dados/matriz-curricular-012.json\`.`);
const matriz=ler('dados/matriz-curricular-012.json');
matriz.versao='012';matriz.lacunas_reduzidas=['Kids ativado com cinco unidades e CEFR','C2 ativado com duas unidades justificadas','Escuta, leitura, escrita e inglês profissional ampliados'];matriz.lacunas_abertas=['Ampliar produção escrita','Diversificar leitura longa','Aumentar prática profissional','Expandir C2 e Kids somente com nova evidência'];matriz.novas_fontes=[...triagem.sequenciais,...triagem.direcionadas].map(x=>x.nome);matriz.situacao_c2='2 unidades com justificativa obrigatória';matriz.situacao_kids='5 unidades infantis com nivel_cefr';
escrever('dados/matriz-curricular-012.json',matriz);
const qualidadePath=path.join(raiz,'docs/AUDITORIA_QUALIDADE_ATIVIDADES.md');
let qualidade=fs.readFileSync(qualidadePath,'utf8');
qualidade=qualidade.replace(/- Sem atividades: \*\*\d+\*\*[\s\S]*?- Máximo encontrado: \*\*\d+\*\*/,`- Sem atividades: **${dist.sem}**\n- Com 1–5: **${dist.umCinco}**\n- Com 6–10: **${dist.seisDez}**\n- Com mais de 10: **${dist.maisDez}**\n- Máximo encontrado: **${dist.maximo}**`);
fs.writeFileSync(qualidadePath,qualidade,'utf8');
console.log(`Documentos 012 finalizados: ${novas} unidades novas, ${atividades.length} atividades finais.`);
