import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = path.resolve(import.meta.dirname, '..');
const base = (process.argv[2] || 'http://127.0.0.1:8000/').replace(/\/?$/, '/');
const out = path.join(root, 'docs/evidencias/redesign-interface');
const routes = ['index.html', 'niveis/a1/', 'niveis/a2/', 'niveis/b1/', 'niveis/b2/', 'niveis/c1/', 'niveis/c2/', 'niveis/kids/', 'jornada.html', 'estudar.html', 'praticar.html'];
const widths = [1440, 1024, 768, 390, 360];
const results = [];
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });

for (const route of routes) for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [], failed = [];
  page.on('console', message => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => failed.push(request.url()));
  const response = await page.goto(new URL(route, base).href, { waitUntil: 'networkidle' });
  const dom = await page.evaluate(() => {
    const text = document.body.innerText;
    const small = [...document.querySelectorAll('button,input,select,.primary,.nav-unit,summary')].filter(element => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
    }).length;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      technical: /Fonte:|\.md\b|Markdown|páginas\/seções|\b(?:A1|A2|B1|B2|C1|C2|KIDS)-[A-Z0-9-]{4,}\b/i.test(text),
      footer: Boolean(document.querySelector('.unit-actions,.unit-nav,.unit-tools,.favorite,.done')),
      small
    };
  });
  results.push({ route, width, status: response?.status(), errors: [...new Set(errors)], failed: [...new Set(failed)], ...dom, ok: response?.status() === 200 && !errors.length && !failed.length && !dom.overflow && !dom.technical && !dom.footer && !dom.small });
  await page.close();
}

const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(new URL('index.html', base).href, { waitUntil: 'networkidle' });
await page.locator('.menu-toggle').click();
const menu = await page.locator('.menu-toggle').getAttribute('aria-expanded');
await page.goto(new URL('niveis/a1/', base).href, { waitUntil: 'networkidle' });
const groups = page.locator('.unit-group');
const collapsed = await groups.evaluateAll(items => items.every(item => !item.open));
const first = groups.first(), second = groups.nth(1), firstSummary = first.locator('summary'), secondSummary = second.locator('summary');
await firstSummary.click();
const opened = await firstSummary.getAttribute('aria-expanded') === 'true';
await secondSummary.click();
const exclusive = (await first.getAttribute('open')) === null && (await second.getAttribute('open')) !== null;
const knownTitle = await second.locator('.unit h3').first().textContent();
await page.locator('#busca').fill(knownTitle);
await page.waitForTimeout(100);
const search = (await page.locator('.unit').count()) > 0 && (await page.locator('.unit-group[open]').count()) === 1;
const unitId = await page.locator('.unit').first().getAttribute('id');
await page.evaluate(id => localStorage.setItem('nivelState', JSON.stringify({ favorites: [id], done: [id] })), unitId);
await page.reload({ waitUntil: 'networkidle' });
const persisted = await page.evaluate(id => { const state = JSON.parse(localStorage.getItem('nivelState')); return state.favorites.includes(id) && state.done.includes(id); }, unitId);
const footerRemoved = (await page.locator('.unit-actions,.unit-nav,.unit-tools,.favorite,.done').count()) === 0;
results.push({ interaction: 'menu,acordeão exclusivo,busca,persistência,rodapé removido', ok: menu === 'true' && collapsed && opened && exclusive && search && persisted && footerRemoved, menu, collapsed, opened, exclusive, search, persisted, footerRemoved });

await browser.close();
const ok = results.every(result => result.ok);
fs.writeFileSync(path.join(out, 'resultados-validacao-redesign.json'), `${JSON.stringify({ resultado: ok ? 'APROVADO' : 'FALHOU', base, resultados: results }, null, 2)}\n`);
console.log(`${ok ? 'APROVADO' : 'FALHOU'}: ${results.length} verificações de interface.`);
if (!ok) process.exitCode = 1;
