import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..');
const niveis = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'];
let removidos = 0;
let caracteres = 0;
let exemplosRemovidos = 0;

for (const nivel of niveis) {
  const arquivo = path.join(raiz, 'dados', nivel, 'unidades.json');
  const unidades = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  for (const unidade of unidades) {
    if (typeof unidade.conteudo_fonte === 'string') {
      removidos += 1;
      caracteres += unidade.conteudo_fonte.length;
      delete unidade.conteudo_fonte;
    }
    if (typeof unidade.observacao_uso === 'string') {
      unidade.observacao_uso = unidade.observacao_uso
        .replace(/(?:O campo )?conteudo_fonte preserva integralmente a seção;?/gi, 'O texto-fonte integral não integra a publicação;')
        .replace(/(?:Texto|Conteúdo) da seção preservado integralmente em conteudo_fonte;?/gi, 'O texto-fonte integral não integra a publicação;')
        .replace(/Seção integral preservada em conteudo_fonte\.?/gi, 'O texto-fonte integral não integra a publicação.')
        .replace(/Conteúdo integral preservado\.?/gi, 'O texto-fonte integral não integra a publicação.')
        .replace(/Fonte integral preservada;?/gi, 'O texto-fonte integral não integra a publicação;');
    }
  }
  fs.writeFileSync(arquivo, JSON.stringify(unidades, null, 2) + '\n', 'utf8');
}

for (const nome of ['mapeamento-fontes-extensas-020.json', 'mapeamento-fontes-extensas-021.json']) {
  const arquivo = path.join(raiz, 'dados', nome);
  const mapa = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  const limpar = (valor) => {
    if (Array.isArray(valor)) {
      for (const item of valor) limpar(item);
      return;
    }
    if (!valor || typeof valor !== 'object') return;
    for (const chave of Object.keys(valor)) {
      if (chave === 'exemplos_uteis_aproveitados' || chave === 'exemplos_aproveitados') {
        const lista = Array.isArray(valor[chave]) ? valor[chave] : [];
        exemplosRemovidos += lista.length;
        caracteres += lista.reduce((soma, item) => soma + (typeof item === 'string' ? item.length : 0), 0);
        delete valor[chave];
      } else {
        limpar(valor[chave]);
      }
    }
  };
  limpar(mapa);
  fs.writeFileSync(arquivo, JSON.stringify(mapa, null, 2) + '\n', 'utf8');
}

console.log(`Publicação sanitizada: ${removidos} campos brutos, ${exemplosRemovidos} exemplos de auditoria e ${caracteres} caracteres removidos.`);
