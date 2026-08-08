import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, ".."),
  read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8")),
  acts = read("dados/atividades.json"),
  audit = read("dados/auditoria-atividades-011.json"),
  tri = read("dados/lote-011-triagem.json"),
  stable = read("dados/auditoria-estabilidade-jornada-011.json"),
  r = [],
  check = (n, o) => {
    r.push({ teste: n, resultado: o ? "APROVADO" : "FALHOU" });
    if (!o) throw Error(n);
  };
for (const t of [
  "reordenar",
  "parear",
  "producao_autorrevisao",
  "identificar_contraste",
])
  check(
    `tipo ${t}`,
    acts.some((a) => a.tipo === t),
  );
check(
  "lacunas triviais removidas",
  acts.every((a) => a.tipo !== "completar_lacuna"),
);
check(
  "sem múltipla escolha inventada",
  acts.every((a) => a.tipo !== "multipla_escolha"),
);
check(
  "origem correta",
  acts.every(
    (a) =>
      a.origem_atividade === "editorial_derivada" ||
      a.origem_atividade === "fonte",
  ),
);
check(
  "respostas não vazias",
  acts.every((a) => Object.keys(a.resposta).length),
);
check("ambíguas excluídas", audit.excluidas > 0);
check(
  "antecipadas sem duplicação",
  new Set(tri.amostragem_direcionada.map((x) => x.numero)).size ===
    tri.amostragem_direcionada.length,
);
check("jornada estável", stable.ids_removidos.length === 0);
const b = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  }),
  p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto("http://127.0.0.1:8000/praticar.html");
await p.waitForSelector("#practiceSetup");
check("abrir praticar.html", p.url().includes("praticar"));
await p.locator("#practiceLevel").selectOption("A1");
check("filtrar A1", (await p.locator("#practiceLevel").inputValue()) === "A1");
await p.locator("#practiceType").selectOption("reordenar");
await p.locator("#startPractice").click();
await p.waitForSelector("#practiceCard");
check("iniciar sessão", await p.locator("#practiceSession").isVisible());
const a = acts.find((x) => x.nivel === "A1" && x.tipo === "reordenar");
await p.locator("#objectiveAnswer").fill(a.resposta.texto);
await p.locator("#checkPractice").click();
check(
  "reordenar corretamente",
  (await p.locator(".feedback").textContent()).includes("correta"),
);
await p.reload();
check("retomar sessão", await p.locator("#resumePractice").isVisible());
await p.locator("#resumePractice").click();
await p.locator("#objectiveAnswer").fill("resposta errada");
await p.locator("#checkPractice").click();
check(
  "feedback de erro",
  (await p.locator(".feedback").textContent()).includes("revisão"),
);
check(
  "erro enviado à revisão",
  await p.evaluate(() =>
    Object.values(
      JSON.parse(localStorage.getItem("studyProgressV1") || "{}"),
    ).some((x) => x.lastRating === "practice-error"),
  ),
);
check(
  "persistência métricas",
  await p.evaluate(
    () => JSON.parse(localStorage.getItem("practiceStatsV1")).answered >= 2,
  ),
);
check(
  "acerto não domina",
  await p.evaluate(
    () =>
      !Object.values(
        JSON.parse(localStorage.getItem("studyProgressV1") || "{}"),
      ).some((x) => x.state === "dominated"),
  ),
);
await p.goto("http://127.0.0.1:8000/praticar.html");
await p.waitForSelector("#practiceSetup");
await p.locator("#practiceType").selectOption("parear");
await p.locator("#startPractice").click();
check("pareamento renderizado", (await p.locator(".pair-select").count()) > 0);
await p.locator("#revealPractice").click();
check("revelar resposta", await p.locator(".feedback").isVisible());
check(
  "abrir unidade original",
  !!(await p.locator(".practice-actions a").getAttribute("href")),
);
await p.goto("http://127.0.0.1:8000/jornada.html?nivel=A1");
await p.waitForSelector(".practice-stage");
check(
  "praticar etapa pela jornada",
  (await p.locator(".practice-stage").count()) > 0,
);
await p.locator(".practice-stage").first().click();
check(
  "filtro de etapa na prática",
  p.url().includes("praticar.html?unidades="),
);
const m = await b.newPage({ viewport: { width: 390, height: 844 } });
await m.goto("http://127.0.0.1:8000/praticar.html");
await m.waitForSelector("#practiceSetup");
check(
  "prática celular",
  await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await m.locator("#startPractice").focus();
check(
  "foco teclado",
  await m.evaluate(
    () => document.activeElement === document.querySelector("#startPractice"),
  ),
);
await b.close();
const out = path.join(root, "docs/evidencias/lote-011");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(
  path.join(out, "resultados-lote011.json"),
  JSON.stringify(
    {
      total: r.length,
      aprovados: r.filter((x) => x.resultado === "APROVADO").length,
      resultados: r,
    },
    null,
    2,
  ) + "\n",
);
console.log(`LOTE 011 TESTES OK: ${r.length}/${r.length}`);
