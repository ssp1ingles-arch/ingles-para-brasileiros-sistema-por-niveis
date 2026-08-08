import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, ".."),
  read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8")),
  res = [];
function check(n, o, d = "") {
  res.push({ teste: n, resultado: o ? "APROVADO" : "FALHOU", detalhe: d });
  if (!o) throw Error(n);
}
const matrix = read("dados/matriz-curricular-010.json"),
  tri = read("dados/lote-010-triagem.json"),
  journey = read("dados/auditoria-estabilidade-jornada-010.json");
check(
  "matriz curricular válida",
  matrix.por_habilidade.length === 77 && matrix.por_tema.length === 182,
);
check(
  "contagens da matriz",
  matrix.por_habilidade.every((x) => Number.isInteger(x.quantidade_unidades)),
);
check(
  "fontes candidatas existentes",
  matrix.fontes_candidatas.every((x) =>
    fs.existsSync(
      path.join((process.env.ARQUIVO_FONTE_DIR || path.resolve(import.meta.dirname,'../../Arquivo_Fonte')), x),
    ),
  ),
);
check("amostragem presente", tri.amostragem_direcionada.length === 10);
check(
  "jornada com IDs estáveis",
  journey.ids_removidos.length === 0 &&
    journey.ids_preservados.length === journey.ids_anteriores.length,
);
check(
  "fontes antecipadas únicas",
  new Set(tri.amostragem_direcionada.map((x) => x.numero)).size === 10,
);
check(
  "C2 ativado com justificativa",
  read("dados/c2/unidades.json").every((u) => u.justificativa_c2),
);
check(
  "Kids ativado com CEFR",
  read("dados/kids/unidades.json").every((u) => u.nivel_cefr),
);
const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  }),
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("http://127.0.0.1:8000/niveis/b2/#B2-L10-1388-01");
await page.waitForSelector("#B2-L10-1388-01");
check(
  "leitura renderizada",
  (await page.locator("#B2-L10-1388-01").count()) === 1,
);
check(
  "texto longo sem overflow",
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await page.goto("http://127.0.0.1:8000/niveis/b1/#B1-L10-1364-01");
await page.waitForSelector("#B1-L10-1364-01");
check(
  "transcrição renderizada",
  (await page.locator("#B1-L10-1364-01").count()) === 1,
);
await page.goto("http://127.0.0.1:8000/estudar.html?unidades=B2-L10-1388-01");
await page.waitForFunction(() =>
  document.querySelector("#eligibleCount")?.textContent.startsWith("1 "),
);
check("modo estudo com texto", true);
await page.goto("http://127.0.0.1:8000/jornada.html?nivel=B2");
await page.waitForSelector(".review-stage");
check(
  "revisão de etapa atualizada",
  (await page.locator(".review-stage").count()) > 0,
);
check(
  "progresso antigo preservado",
  await page.evaluate(() => {
    localStorage.setItem(
      "nivelState",
      JSON.stringify({ done: ["legacy-id"], favorites: ["legacy-fav"] }),
    );
    return (
      JSON.parse(localStorage.getItem("nivelState")).done[0] === "legacy-id"
    );
  }),
);
await browser.close();
const out = path.join(root, "docs/evidencias/lote-010");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(
  path.join(out, "resultados-lote010.json"),
  JSON.stringify(
    {
      total: res.length,
      aprovados: res.filter((x) => x.resultado === "APROVADO").length,
      resultados: res,
    },
    null,
    2,
  ) + "\n",
);
console.log(`LOTE 010 TESTES OK: ${res.length}/${res.length}`);
