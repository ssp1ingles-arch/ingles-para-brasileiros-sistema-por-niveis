import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const raiz = path.resolve(import.meta.dirname, '..');
const base = (process.argv[2] || 'https://ssp1ingles-arch.github.io/ingles-para-brasileiros-sistema-por-niveis/').replace(/\/?$/, '/');
const rotas = (() => {
  const visitar = diretorio => fs.readdirSync(diretorio, { withFileTypes: true }).flatMap(item => {
    if (['node_modules', '.git'].includes(item.name)) return [];
    const absoluto = path.join(diretorio, item.name);
    if (item.isDirectory()) return visitar(absoluto);
    return item.name.endsWith('.html') ? [path.relative(raiz, absoluto).replaceAll('\\', '/')] : [];
  });
  return visitar(raiz).sort();
})();

const navegador = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
});
const auditoria = [];
for (const rota of rotas) {
  const erros = [];
  const falhas = [];
  const pagina = await navegador.newPage({ viewport: { width: 1440, height: 1000 } });
  pagina.on('console', mensagem => { if (mensagem.type() === 'error') erros.push(mensagem.text()); });
  pagina.on('pageerror', erro => erros.push(erro.message));
  pagina.on('requestfailed', requisicao => falhas.push(`${requisicao.method()} ${requisicao.url()}: ${requisicao.failure()?.errorText || 'falha'}`));
  const resposta = await pagina.goto(new URL(rota, base).href, { waitUntil: 'networkidle' });
  const desktop = await pagina.evaluate(() => ({
    largura: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
    titulo: document.title.trim()
  }));
  await pagina.setViewportSize({ width: 390, height: 844 });
  await pagina.reload({ waitUntil: 'networkidle' });
  const celular = await pagina.evaluate(() => ({
    largura: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth
  }));
  auditoria.push({
    rota,
    status: resposta?.status() || null,
    titulo: desktop.titulo,
    erros: [...new Set(erros)],
    falhas: [...new Set(falhas)],
    overflow_desktop: desktop.largura > desktop.viewport,
    overflow_celular: celular.largura > celular.viewport
  });
  await pagina.close();
}
await navegador.close();

const aprovadas = auditoria.filter(item => item.status === 200 && item.titulo && !item.erros.length && !item.falhas.length && !item.overflow_desktop && !item.overflow_celular).length;
console.log(JSON.stringify({ base, total: auditoria.length, aprovadas, auditoria }, null, 2));
if (rotas.length !== 11 || aprovadas !== rotas.length) process.exit(1);
