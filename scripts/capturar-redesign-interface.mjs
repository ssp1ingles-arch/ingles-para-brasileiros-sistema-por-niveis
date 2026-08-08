import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const raiz = path.resolve(import.meta.dirname, '..');
const saida = path.join(raiz, 'docs/evidencias/redesign-interface');
const etiqueta = process.argv[2] || 'antes';
const base = (process.argv[3] || 'http://127.0.0.1:8000/').replace(/\/?$/, '/');
fs.mkdirSync(saida, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const alvos = [
  ['inicio', 'index.html'],
  ['a1', 'niveis/a1/index.html'],
  ['jornada', 'jornada.html'],
  ['praticar', 'praticar.html'],
  ['estudar-revisar', 'estudar.html']
];
const viewports = [['desktop', 1440, 1000], ['mobile', 390, 844]];
const auditoria = [];
for (const [tela, rota] of alvos) {
  for (const [modo, width, height] of viewports) {
    const page = await browser.newPage({ viewport: { width, height } });
    const erros = [];
    page.on('console', message => { if (message.type() === 'error') erros.push(message.text()); });
    page.on('pageerror', error => erros.push(error.message));
    const response = await page.goto(new URL(rota, base).href, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(saida, `${tela}-${etiqueta}-${modo}.png`), fullPage: true });
    if (tela === 'a1') {
      const unidade = page.locator('.unit').first();
      if (await unidade.count()) await unidade.screenshot({ path: path.join(saida, `cartao-unidade-${etiqueta}-${modo}.png`) });
    }
    const estado = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      fonteVisivel: /Fonte:/i.test(document.body.innerText),
      markdownVisivel: /\.md\b|Markdown|páginas\/seções/i.test(document.body.innerText),
      idsTecnicosVisiveis: /\b(?:A1|A2|B1|B2|C1|C2|KIDS)-[A-Z0-9-]{4,}\b/.test(document.body.innerText),
      botoesPequenos: [...document.querySelectorAll('button,a,input,select')].filter(el => { const rect=el.getBoundingClientRect(); return rect.width>0&&rect.height>0&&(rect.height<44||rect.width<44); }).length,
      h1: document.querySelector('h1')?.textContent?.trim() || '',
      texto: document.body.innerText.length
    }));
    auditoria.push({ etiqueta, tela, rota, modo, status: response?.status(), erros: [...new Set(erros)], ...estado });
    await page.close();
  }
}
await browser.close();
fs.writeFileSync(path.join(saida, `auditoria-${etiqueta}.json`), `${JSON.stringify(auditoria, null, 2)}\n`);
console.log(`Evidências ${etiqueta}: ${auditoria.length} combinações.`);
