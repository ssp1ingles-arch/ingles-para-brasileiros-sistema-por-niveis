import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dados = path.join(raiz, 'dados');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(dados, arquivo), 'utf8'));
const unidades = fs.readdirSync(dados, { withFileTypes: true })
  .filter(item => item.isDirectory())
  .flatMap(item => {
    const arquivo = path.join(dados, item.name, 'unidades.json');
    return fs.existsSync(arquivo) ? JSON.parse(fs.readFileSync(arquivo, 'utf8')) : [];
  });
const revisao = ler('revisao-fontes.json');
const mapa = ler('mapa-fontes.json');
const atividades = ler('atividades.json');
const jornadas = ler('jornadas.json');
const subpaineis = ler('subpaineis.json');

const contar = (lista, chave) => Object.fromEntries([...new Set(lista.map(x => x[chave] || 'Não informado'))]
  .sort((a, b) => a.localeCompare(b, 'pt-BR'))
  .map(valor => [valor, lista.filter(x => (x[chave] || 'Não informado') === valor).length]));
const estados = Object.values(revisao).map(x => x.estado || 'não analisada');
const integral = estados.filter(x => x.includes('integralmente classificada')).length;
const duplicatas = estados.filter(x => x === 'duplicata').length;
const parciais = estados.filter(x => x.includes('parcial')).length;
const semDidatico = estados.filter(x => x.includes('sem conteúdo didático')).length;
const tratados = integral + duplicatas + parciais + semDidatico;
const totalFontes = mapa.total || mapa.arquivos.length;
const cobertura = (tratados / totalFontes * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const niveis = ler('niveis.json').map(nivel => nivel.id.toUpperCase());
const porNivel = Object.fromEntries(niveis.map(nivel => [nivel === 'KIDS' ? 'Kids' : nivel, unidades.filter(x => x.nivel?.toUpperCase() === nivel).length]));
const porHabilidade = contar(unidades, 'habilidade_principal');
const porTipo = contar(atividades, 'tipo');
const etapas = jornadas.reduce((n, j) => n + j.etapas.length, 0);
const modulos = jornadas.reduce((n, j) => n + j.etapas.reduce((m, e) => m + e.modulos.length, 0), 0);

function htmls(dir = raiz) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => {
    if (item.name === 'node_modules' || item.name === '.git') return [];
    const destino = path.join(dir, item.name);
    return item.isDirectory() ? htmls(destino) : item.name.endsWith('.html') ? [path.relative(raiz, destino).replaceAll('\\', '/')] : [];
  });
}

const resultadosTestes = [
  'docs/evidencias/lote-009/resultados-interacao.json',
  'docs/evidencias/lote-010/resultados-lote010.json',
  'docs/evidencias/lote-011/resultados-lote011.json',
  'docs/evidencias/lote-012/resultados-rotas-012.json',
  'docs/evidencias/lote-012/resultados-validacao-012.json',
  'docs/evidencias/lote-013/resultados-validacao-013.json'
  ,'docs/evidencias/lote-013/resultados-rotas-013.json'
  ,'docs/evidencias/lote-014/resultados-validacao-014.json'
  ,'docs/evidencias/lote-014/resultados-rotas-014.json'
  ,'docs/evidencias/lote-015/resultados-validacao-015.json'
  ,'docs/evidencias/lote-015/resultados-rotas-015.json'
  ,'docs/evidencias/lote-016/resultados-validacao-016.json'
  ,'docs/evidencias/lote-016/resultados-rotas-016.json'
  ,'docs/evidencias/lote-017/resultados-validacao-017.json'
  ,'docs/evidencias/lote-017/resultados-rotas-017.json'
  ,'docs/evidencias/lote-018/resultados-validacao-018.json'
  ,'docs/evidencias/lote-018/resultados-rotas-018.json'
  ,'docs/evidencias/lote-019/resultados-validacao-019.json'
  ,'docs/evidencias/lote-019/resultados-rotas-019.json'
  ,'docs/evidencias/lote-020/resultados-validacao-020.json'
  ,'docs/evidencias/lote-020/resultados-rotas-020.json'
  ,'docs/evidencias/lote-021/resultados-validacao-021.json'
  ,'docs/evidencias/lote-021/resultados-rotas-021.json'
  ,'docs/evidencias/lote-022/resultados-validacao-022.json'
  ,'docs/evidencias/lote-022/resultados-rotas-022.json'
  ,'docs/evidencias/lote-023/resultados-validacao-023.json'
  ,'docs/evidencias/lote-023/resultados-rotas-023.json'
  ,'docs/evidencias/lote-024/resultados-validacao-024.json'
  ,'docs/evidencias/lote-024/resultados-comparacao-024.json'
  ,'docs/evidencias/lote-024/resultados-rotas-024.json'
  ,'docs/evidencias/lote-025/resultados-intermediarios-1189.json'
  ,'docs/evidencias/lote-025/resultados-validacao-025.json'
  ,'docs/evidencias/lote-025/resultados-comparacao-025.json'
  ,'docs/evidencias/lote-025/resultados-rotas-025.json'
  ,'docs/evidencias/lote-026/resultados-intermediarios-1191.json'
  ,'docs/evidencias/lote-026/resultados-validacao-026.json'
  ,'docs/evidencias/lote-026/resultados-comparacao-026.json'
  ,'docs/evidencias/lote-026/resultados-rotas-026.json'
  ,'docs/evidencias/lote-027/resultados-intermediarios-1193.json'
  ,'docs/evidencias/lote-027/resultados-validacao-027.json'
  ,'docs/evidencias/lote-027/resultados-comparacao-027.json'
  ,'docs/evidencias/lote-027/resultados-rotas-027.json'
  ,'docs/evidencias/lote-028/resultados-intermediarios-1195.json'
  ,'docs/evidencias/lote-028/resultados-validacao-028.json'
  ,'docs/evidencias/lote-028/resultados-comparacao-028.json'
  ,'docs/evidencias/lote-028/resultados-rotas-028.json'
  ,'docs/evidencias/lote-029/resultados-intermediarios-1197.json'
  ,'docs/evidencias/lote-029/resultados-fonte1198.json'
  ,'docs/evidencias/lote-029/resultados-validacao-029.json'
  ,'docs/evidencias/lote-029/resultados-comparacao-029.json'
  ,'docs/evidencias/lote-029/resultados-rotas-029.json'
  ,'docs/evidencias/lote-030/resultados-intermediarios-1200.json'
  ,'docs/evidencias/lote-030/resultados-validacao-030.json'
  ,'docs/evidencias/lote-030/resultados-comparacao-030.json'
  ,'docs/evidencias/lote-030/resultados-rotas-030.json'
  ,'docs/evidencias/lote-031/resultados-intermediarios-1205.json'
  ,'docs/evidencias/lote-031/resultados-validacao-031.json'
  ,'docs/evidencias/lote-031/resultados-comparacao-031.json'
  ,'docs/evidencias/lote-031/resultados-rotas-031.json'
  ,'docs/evidencias/lote-032/resultados-intermediarios-1207.json'
  ,'docs/evidencias/lote-032/resultados-validacao-032.json'
  ,'docs/evidencias/lote-032/resultados-comparacao-032.json'
  ,'docs/evidencias/lote-032/resultados-rotas-032.json'
  ,'docs/evidencias/lote-033/resultados-intermediarios-1209.json'
  ,'docs/evidencias/lote-033/resultados-validacao-033.json'
  ,'docs/evidencias/lote-033/resultados-comparacao-033.json'
  ,'docs/evidencias/lote-033/resultados-rotas-033.json'
  ,'docs/evidencias/lote-034/resultados-intermediarios-1211.json'
  ,'docs/evidencias/lote-034/resultados-validacao-034.json'
  ,'docs/evidencias/lote-034/resultados-comparacao-034.json'
  ,'docs/evidencias/lote-034/resultados-rotas-034.json'
  ,'docs/evidencias/lote-035/resultados-intermediarios-1213.json'
  ,'docs/evidencias/lote-035/resultados-validacao-035.json'
  ,'docs/evidencias/lote-035/resultados-comparacao-035.json'
  ,'docs/evidencias/lote-035/resultados-rotas-035.json'
  ,'docs/evidencias/lote-036/resultados-intermediarios-1215.json'
  ,'docs/evidencias/lote-036/resultados-validacao-036.json'
  ,'docs/evidencias/lote-036/resultados-comparacao-036.json'
  ,'docs/evidencias/lote-036/resultados-rotas-036.json'
  ,'docs/evidencias/lote-037/resultados-intermediarios-1217.json'
  ,'docs/evidencias/lote-037/resultados-validacao-037.json'
  ,'docs/evidencias/lote-037/resultados-comparacao-037.json'
  ,'docs/evidencias/lote-037/resultados-rotas-037.json'
  ,'docs/evidencias/lote-038/resultados-intermediarios-1219.json'
  ,'docs/evidencias/lote-038/resultados-validacao-038.json'
  ,'docs/evidencias/lote-038/resultados-comparacao-038.json'
  ,'docs/evidencias/lote-038/resultados-rotas-038.json'
  ,'docs/evidencias/lote-039/resultados-intermediarios-1221.json'
  ,'docs/evidencias/lote-039/resultados-validacao-039.json'
  ,'docs/evidencias/lote-039/resultados-comparacao-039.json'
  ,'docs/evidencias/lote-039/resultados-rotas-039.json'
  ,'docs/evidencias/lote-040/resultados-intermediarios-1223.json'
  ,'docs/evidencias/lote-040/resultados-validacao-040.json'
  ,'docs/evidencias/lote-040/resultados-comparacao-040.json'
  ,'docs/evidencias/lote-040/resultados-rotas-040.json'
].map(arquivo => {
  const resultado = JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
  if (resultado.total !== resultado.aprovados) throw new Error(`Suíte registrada com falhas: ${arquivo}`);
  return resultado;
});
const testes = resultadosTestes.reduce((total, resultado) => total + resultado.total, 0);

const fontesOrdenadas = mapa.arquivos.filter(x => /^\d{4}/.test(x.id)).sort((a, b) => Number(a.id) - Number(b.id));
const numerosSequenciais = fs.readdirSync(dados).filter(nome => /^lote-\d+-triagem\.json$/.test(nome)).flatMap(nome => {
  const triagem = JSON.parse(fs.readFileSync(path.join(dados, nome), 'utf8'));
  return (triagem.sequenciais || []).map(item => Number(item.numero ?? item.id)).filter(Number.isFinite);
});
const ultimoNumero = Math.max(0, ...numerosSequenciais);
const ultima = fontesOrdenadas.find(fonte => Number(fonte.id) === ultimoNumero) || null;
const proxima = fontesOrdenadas.find(x => Number(x.id) > Number(ultima?.id || 0) && !revisao[x.id]);
const lista = obj => Object.entries(obj).map(([k, v]) => `${k} **${v}**`).join('; ');
const rotas = htmls().sort();
const bloco = `<!-- ESTADO-ATUAL:INICIO -->
## Estado atual confirmado

> Bloco calculado automaticamente por \`scripts/atualizar-progresso.mjs\`. Não editar os números manualmente.

- Total de fontes: **${totalFontes.toLocaleString('pt-BR')}**
- Fontes integralmente classificadas: **${integral}**
- Duplicatas consolidadas: **${duplicatas}**
- Fontes parcialmente analisadas: **${parciais}**
- Fontes sem conteúdo didático: **${semDidatico}**
- Total tratado: **${tratados}**
- Fontes não analisadas: **${totalFontes - tratados}**
- Cobertura real: **${cobertura}%** (\`${tratados} ÷ ${totalFontes.toLocaleString('pt-BR')}\`)
- Unidades publicadas: **${unidades.length}**
- Por nível: ${lista(porNivel)}
- Habilidade principal: ${lista(porHabilidade)}
- Subpainéis: **${subpaineis.length}**
- Jornada: **${etapas} etapas**, **${modulos} módulos** e **${jornadas.length} níveis ativos**
- Atividades: **${atividades.length}** — ${lista(porTipo)}
- Testes executados e aprovados: **${testes}/${testes}**
- Rotas HTML existentes: **${rotas.length}** — ${rotas.map(x => `\`${x}\``).join(', ')}
- Última fonte sequencial tratada: \`${ultima?.arquivo || 'nenhuma'}\`
- Próxima fonte sequencial: \`${proxima?.arquivo || 'nenhuma'}\`
<!-- ESTADO-ATUAL:FIM -->`;

const validacoes = `<!-- VALIDACOES-VIGENTES:INICIO -->
## Validações vigentes

> Bloco calculado automaticamente por \`scripts/atualizar-progresso.mjs\`. A execução das suítes ocorre separadamente, com servidor local ativo.

- **${unidades.length} IDs únicos esperados** entre as unidades publicadas; JSON e JavaScript sujeitos à suíte de validação.
- **${subpaineis.length} subpainéis**, **${etapas} etapas** e **${modulos} módulos** registrados nos dados atuais.
- **${atividades.length} atividades** em ${Object.keys(porTipo).length} tipos: ${lista(porTipo)}.
- **${rotas.length} rotas HTML existentes**: ${rotas.map(x => `\`${x}\``).join(', ')}.
- Último resultado persistido das suítes vigentes: **${testes}/${testes} testes aprovados**.
- Hashes e estados vêm de \`dados/mapa-fontes.json\` e \`dados/revisao-fontes.json\`; \`Arquivo_Fonte\` permanece somente para leitura.
<!-- VALIDACOES-VIGENTES:FIM -->`;

const progressoPath = path.join(raiz, 'docs', 'PROGRESSO.md');
let progresso = fs.readFileSync(progressoPath, 'utf8');
const ultimoLote = Math.max(...fs.readdirSync(dados).map(nome => Number(nome.match(/^lote-(\d+)-triagem\.json$/)?.[1] || 0)));
const dataAtual = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
progresso = progresso.replace(/^Atualizado em .*$/m, `Atualizado em ${dataAtual} após o lote ${String(ultimoLote).padStart(3, '0')}.`);
// Blocos manuais de retomada ficam obsoletos e competem com o estado calculado.
progresso = progresso.replace(/\n## Retomada\n[\s\S]*?(?=\n## |\s*$)/g, '');
const regex = /(?:<!-- ESTADO-ATUAL:INICIO -->\s*)?## Estado atual confirmado[\s\S]*?(?=\n## Lote 007)/;
if (!regex.test(progresso)) throw new Error('Bloco de estado atual não encontrado em PROGRESSO.md.');
progresso = progresso.replace(regex, bloco + '\n');
const regexValidacoes = /(?:<!-- VALIDACOES-VIGENTES:INICIO -->\s*)?## Validações vigentes[\s\S]*?(?=\n## Interface e inspeção visual)/;
if (!regexValidacoes.test(progresso)) throw new Error('Bloco de validações vigentes não encontrado em PROGRESSO.md.');
progresso = progresso.replace(regexValidacoes, validacoes + '\n');
const foraDoEstado = progresso.replace(/<!-- ESTADO-ATUAL:INICIO -->[\s\S]*?<!-- ESTADO-ATUAL:FIM -->/, '');
const conflitos = foraDoEstado.match(/^## Estado atual confirmado$|^## Retomada$|^- Próxima fonte sequencial:|^- Total tratado:/gm) || [];
if (conflitos.length) throw new Error(`Informação corrente conflitante fora do bloco automático: ${conflitos.join(' | ')}`);
const marcadorLote033 = '<!-- LOTE-033-PROGRESSO:INICIO -->';
if (ultimoLote >= 33 && !progresso.includes(marcadorLote033)) {
  progresso = `${progresso.trim()}\n\n${marcadorLote033}\n## Lote 033\n\n- Sequenciais: 1209–1210; dois OCRs de imagens integralmente classificados e visualmente conferidos.\n- Relação: fragmentos complementares; futuro afirmativo e possibilidade modal com think destinados separadamente.\n- Totais preservados: 834 unidades, 1.977 atividades, 95 subpainéis, Jornada 806+28.\n- Última: \`1210_820B6A28-0D00-414B-9AC3-DFBE93D13F4E.md\`; próxima: \`1211_A513BBF1-660F-425A-89DF-128DF888FE65.md\`.\n<!-- LOTE-033-PROGRESSO:FIM -->\n`;
}
const marcadorLote034 = '<!-- LOTE-034-PROGRESSO:INICIO -->';
if (ultimoLote >= 34 && !progresso.includes(marcadorLote034)) {
  progresso = `${progresso.trim()}\n\n${marcadorLote034}\n## Lote 034\n\n- Sequenciais: 1211–1212; dois OCRs de imagens integralmente classificados e visualmente conferidos.\n- Relação: fragmentos complementares; past perfect e presente simples de think consolidados no mesmo destino existente.\n- Totais preservados: 834 unidades, 1.977 atividades, 95 subpainéis, Jornada 806+28.\n- Última: \`1212_C403A60B-9EDA-4826-B134-DFDE49801CA7.md\`; próxima: \`1213_E29CFFA1-923C-4363-9DBF-C2D88DC28A01.md\`.\n<!-- LOTE-034-PROGRESSO:FIM -->\n`;
}
const marcadorLote035 = '<!-- LOTE-035-PROGRESSO:INICIO -->';
if (ultimoLote >= 35 && !progresso.includes(marcadorLote035)) {
  progresso = `${progresso.trim()}\n\n${marcadorLote035}\n## Lote 035\n\n- Sequenciais: 1213–1214; um fragmento visual e um PDF curto integralmente classificados.\n- Relação: fontes independentes com sobreposição temática parcial em pronúncia natural.\n- Totais preservados: 834 unidades, 1.977 atividades, 95 subpainéis, Jornada 806+28.\n- Última: \`1214_QW_SALA04_PDF1_CONNECTED_SPEECH_CONNECTED_SPEECH_FLAP_T_2.md\`; próxima: \`1215_QW_SALA04_PDF2_CONTENT_FUNCTION_CONTENT_WORDS_FUNCTION_WORDS_STRESS_2.md\`.\n<!-- LOTE-035-PROGRESSO:FIM -->\n`;
}
const marcadorLote037 = '<!-- LOTE-037-PROGRESSO:INICIO -->';
if (ultimoLote >= 37 && !progresso.includes(marcadorLote037)) {
  progresso = `${progresso.trim()}\n\n${marcadorLote037}\n## Lote 037\n\n- Sequenciais: 1217–1218; uma duplicata integral e uma página agregadora integralmente classificada.\n- Relação: 1217 repete 0144/0781; 1218 contém integralmente os quatro blocos 1214–1217 e não possui conteúdo didático exclusivo.\n- Totais preservados: 834 unidades, 1.977 atividades, 95 subpainéis, Jornada 806+28.\n- Última: \`1218_entender-nativos.md\`; próxima: \`1219_erros-de-som.md\`.\n<!-- LOTE-037-PROGRESSO:FIM -->\n`;
}
const marcadorLote038 = '<!-- LOTE-038-PROGRESSO:INICIO -->';
if (ultimoLote >= 38 && !progresso.includes(marcadorLote038)) {
  progresso = `${progresso.trim()}\n\n${marcadorLote038}\n## Lote 038\n\n- Sequenciais: 1219–1220; uma página didática e um índice/hub integralmente classificados.\n- Relação: 1219 foi consolidada em destinos existentes; 1220 apenas referencia fontes numeradas e não virou lição.\n- Totais preservados: 834 unidades, 1.977 atividades, 95 subpainéis, Jornada 806+28.\n- Última: \`1220_index_8.md\`; próxima: \`1221_livro-x-rua.md\`.\n<!-- LOTE-038-PROGRESSO:FIM -->\n`;
}
const marcadorLote039 = '<!-- LOTE-039-PROGRESSO:INICIO -->';
if (ultimoLote >= 39 && !progresso.includes(marcadorLote039)) {
  progresso = `${progresso.trim()}\n\n${marcadorLote039}\n## Lote 039\n\n- Sequenciais: 1221–1222; duas páginas didáticas integralmente classificadas.\n- Relação: fontes independentes; 1222 é curadoria derivada da obra-base 1202 e sobrepõe parcialmente 1214–1218.\n- Totais preservados: 834 unidades, 1.977 atividades, 95 subpainéis, Jornada 806+28.\n- Última: \`1222_livro01_4.md\`; próxima: \`1223_livro02_4.md\`.\n<!-- LOTE-039-PROGRESSO:FIM -->\n`;
}
const marcadorLote040 = '<!-- LOTE-040-PROGRESSO:INICIO -->';
if (ultimoLote >= 40 && !progresso.includes(marcadorLote040)) {
  progresso = `${progresso.trim()}\n\n${marcadorLote040}\n## Lote 040\n\n- Sequenciais: 1223–1224; duas curadorias de pronúncia integralmente classificadas.\n- Relação: inventário sistemático e mapa diagnóstico complementares, não duplicatas.\n- Totais preservados: 834 unidades, 1.977 atividades, 95 subpainéis, Jornada 806+28.\n- Última: \`1224_livro03_4.md\`; próxima: \`1225_reducoes.md\`.\n<!-- LOTE-040-PROGRESSO:FIM -->\n`;
}
fs.writeFileSync(progressoPath, progresso, 'utf8');
console.log(`PROGRESSO atualizado: ${tratados}/${totalFontes} fontes, ${unidades.length} unidades, ${atividades.length} atividades, ${testes}/${testes} testes, ${rotas.length} rotas.`);
