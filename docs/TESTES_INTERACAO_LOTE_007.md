# Testes de interação — lote 007

Executados em 2026-08-07 com Playwright e Chrome local contra o servidor HTTP do projeto.

## Resultado

- **28/28 testes aprovados**.
- Abertura, fechamento, `aria-expanded`, `aria-controls` e região controlada.
- Persistência dos recolhíveis, favoritos e conclusão após recarga.
- Busca, limpeza, abertura automática do grupo e filtros principal, secundário e painel.
- Contagens recalculadas e remoção de grupos vazios.
- Anterior/próxima, limites inicial/final e respeito à ordem global filtrada.
- Teclado Enter/Espaço, foco visível e nomes acessíveis.
- Viewport móvel de 390 px sem rolagem horizontal.

Durante o teste foi encontrada e corrigida uma regressão que achatava os grupos quando a busca retornava menos de 30 unidades. A inspeção visual também encontrou acentos corrompidos nas páginas derivadas; o gerador passou a ler o modelo explicitamente como UTF-8 e as capturas foram refeitas.

Resultado estruturado: `docs/evidencias/lote-007/resultados-interacao.json`.

Capturas: `a1-desktop.png`, `a2-desktop.png`, `b1-desktop.png`, `b2-desktop.png`, `c1-desktop.png`, `a2-mobile.png`, `b1-mobile.png`, `a2-multiplos-subpaineis-foco.png`, `a2-busca.png` e `a2-filtrado.png`.
