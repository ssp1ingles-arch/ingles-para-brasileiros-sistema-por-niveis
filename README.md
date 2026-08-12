# Inglês para Brasileiros — Sistema por Níveis

Repositório público de um sistema estático de aprendizado de inglês organizado por níveis A1, A2, B1, B2, C1, C2 e Kids. O conteúdo publicado é rastreável até fontes Markdown analisadas, mas os livros, transcrições integrais e arquivos originais não são redistribuídos neste repositório.

## Modos principais

- Painéis curriculares por nível, habilidade, tema e subpainel.
- Jornada Guiada com etapas e módulos em ordem pedagógica.
- Estudar/Revisar com favoritos, progresso e retomada local.
- Praticar com atividades verificáveis e não ambíguas.

## Executar localmente

Requer Python 3 para o servidor estático e Node.js para as validações:

```powershell
npm install
python -m http.server 8000 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8000/`.

## Validar

```powershell
node scripts/validar.mjs
node scripts/validar-lote035.mjs
node scripts/validar-comparacao-lote035.mjs
```

As auditorias de rotas exigem o servidor local em execução. Consulte `docs/PROGRESSO.md` e os artefatos de `docs/evidencias/` para os resultados vigentes.

## Checkpoint

Após o lote 042: 1.273 de 1.547 fontes tratadas (82,29%), 834 unidades, 95 subpainéis, 1.977 atividades, Jornada com 806 unidades presentes e 28 complementares, 1.406/1.406 testes e 11/11 rotas.

O progresso deve ser atualizado exclusivamente por:

```powershell
node scripts/atualizar-progresso.mjs
```

## Estrutura

- `dados/`: unidades, atividades, Jornada, mapas e auditorias.
- `docs/`: decisões, progresso, mapeamentos e evidências oficiais.
- `scripts/`: aplicação dos lotes e validações.
- `css/` e `js/`: interface e comportamento do sistema.
- `niveis/`: páginas de A1 a C2 e Kids.
- `assets/`: recursos locais do site.

## Fontes e direitos

`Arquivo_Fonte` é uma árvore externa, estritamente somente para leitura, e não pertence ao repositório. O sistema anterior também permanece externo. Fontes originais, PDFs, livros, imagens de páginas e transcrições integrais não são redistribuídos; o repositório contém apenas a aplicação, dados educacionais estruturados, procedências técnicas e registros de auditoria.

Materiais, marcas, títulos e referências de terceiros permanecem pertencentes aos respectivos titulares. A disponibilização pública do código e da estrutura do sistema não concede direitos sobre materiais externos. Nenhuma licença aberta abrangente é aplicada automaticamente ao conteúdo educacional ou a referências de terceiros.

## Estado de desenvolvimento

O sistema permanece em desenvolvimento enquanto houver fontes pendentes. Cada lote deve ser integralmente validado antes de commit e push para a branch `main`.
