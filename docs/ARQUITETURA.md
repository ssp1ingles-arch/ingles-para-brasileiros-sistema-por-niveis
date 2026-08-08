# Arquitetura

Aplicação estática, sem servidor e com separação entre apresentação (`index.html`, `niveis/`, `css/`, `js/`), conteúdo estruturado (`dados/`) e processos auditáveis (`scripts/`, `docs/`).

`app.js` carrega os JSON, renderiza cards, busca e filtros. Progresso e favoritos usam `localStorage`. Cada nível possui `unidades.json`; unidades podem apontar para vários painéis, enquanto `mapa-fontes.json` mantém as 1.547 fontes, hashes e estado editorial.

O navegador deve abrir o projeto por um servidor HTTP local, pois `fetch()` não é confiável sob `file://`.
