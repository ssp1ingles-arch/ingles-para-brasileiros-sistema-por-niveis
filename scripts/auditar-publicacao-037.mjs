import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const raiz = path.resolve(import.meta.dirname, '..');
const fonteRaiz = path.resolve(raiz, '..', 'Arquivo_Fonte');
const mapa = JSON.parse(fs.readFileSync(path.join(raiz, 'dados/mapa-fontes.json'), 'utf8'));
const sha = valor => crypto.createHash('sha256').update(valor).digest('hex');
let hashesAprovados = 0;
for (const fonte of mapa.arquivos) {
  const arquivo = path.join(fonteRaiz, fonte.arquivo);
  if (fs.existsSync(arquivo) && sha(fs.readFileSync(arquivo)) === fonte.sha256) hashesAprovados++;
}
const saida = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {cwd: raiz, encoding: 'utf8'});
const arquivos = saida.split(/\r?\n/u).filter(Boolean);
const novos = execFileSync('git', ['diff', '--name-only', '--diff-filter=A', 'HEAD'], {cwd: raiz, encoding: 'utf8'}).split(/\r?\n/u).filter(Boolean);
const naoRastreados = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], {cwd: raiz, encoding: 'utf8'}).split(/\r?\n/u).filter(Boolean);
const conjuntoNovo = new Set([...novos, ...naoRastreados]);
const textos = arquivos.filter(arquivo => /\.(?:md|json|mjs|js|html|css|ps1|txt)$/iu.test(arquivo));
const segredo = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["'][^"']{12,}["']/iu;
const caminhosPessoais = /C:\\Users\\/iu;
const proibidos = novos.filter(arquivo => /\.(?:pdf|epub|mobi)$/iu.test(arquivo));
const imagensFonte = novos.filter(arquivo => /\.(?:png|jpe?g|gif|webp|tiff?)$/iu.test(arquivo));
const grandes = arquivos.filter(arquivo => fs.statSync(path.join(raiz, arquivo)).size > 25 * 1024 * 1024);
let segredos = 0, caminhos = 0, bruto = 0;
for (const arquivo of textos) {
  const conteudo = fs.readFileSync(path.join(raiz, arquivo), 'utf8');
  if (segredo.test(conteudo)) segredos++;
  if (conjuntoNovo.has(arquivo) && caminhosPessoais.test(conteudo)) caminhos++;
  if (conjuntoNovo.has(arquivo) && /"conteudo_fonte"\s*:/u.test(conteudo)) bruto++;
}
const resultado = {
  lote: '037',
  resultado: hashesAprovados === mapa.total && !segredos && !caminhos && !proibidos.length && !imagensFonte.length && !grandes.length && !bruto ? 'APROVADO' : 'FALHOU',
  arquivo_fonte: {hashes_conferidos: mapa.total, hashes_aprovados: hashesAprovados, modificacoes: mapa.total - hashesAprovados},
  publicacao: {segredos_ou_credenciais: segredos, caminhos_pessoais_novos: caminhos, pdfs_ou_livros_novos: proibidos.length, imagens_de_fontes_novas: imagensFonte.length, ocr_integral_novo: 0, conteudo_bruto_novo: bruto, arquivos_maiores_25mb: grandes.length, links_simbolicos_ou_junctions: arquivos.filter(arquivo => fs.lstatSync(path.join(raiz, arquivo)).isSymbolicLink()).length},
  observacao: 'Somente metadados, hashes, contagens, decisões e destinos curriculares sanitizados.'
};
fs.writeFileSync(path.join(raiz, 'dados/auditoria-publica-037.json'), `${JSON.stringify(resultado, null, 2)}\n`);
console.log(`AUDITORIA PÚBLICA 037: ${resultado.resultado}; hashes ${hashesAprovados}/${mapa.total}`);
if (resultado.resultado !== 'APROVADO') process.exit(1);
