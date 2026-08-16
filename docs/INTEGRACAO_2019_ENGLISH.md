# Integração 2019 English

## Contrato

A pasta `D:\AI\3_Coversão_em_marldown\2019_English\01_arquivos_extraídos_e_convertidos_em_md` é somente leitura. A integração usa a ordem do manifesto aprovado, decide cada seção, compara com destinos curriculares existentes e publica apenas sínteses editoriais e procedência sanitizada. Livros, páginas, exercícios, respostas e transcrições integrais não entram no repositório.

O progresso distingue 91 fontes aprovadas, duas complementares, fontes revisadas, fontes integradas, fontes sem conteúdo novo e pendências. Um arquivo aberto só conta quando todas as seções receberam decisão persistida.

## Lote 001

Foi selecionada a primeira fonte aprovada do manifesto, `BBC_English_Plus_indice_do_curso_PT_EN.md`. Ela é uma fonte pequena/média de 30 unidades e antecede três fontes extensas; por isso o lote foi reduzido a uma fonte para preservar a leitura integral.

As 30 unidades do índice foram lidas e comparadas com o currículo publicado. Todas descrevem objetivos já cobertos por unidades canônicas de A1 a B1. O índice não contém explicações, exemplos nem exercícios autônomos, portanto não justificou conteúdo ou atividade nova. A procedência e os destinos ficam em `dados/integracao-2019-english-lote-001.json`.

Resultado: 30 seções examinadas, 30 já cobertas, zero duplicatas parciais independentes, zero complementos publicáveis, zero conteúdo novo e zero descartes. Foram preservados 834 IDs, 1.977 atividades, 95 subpainéis e a Jornada existente.

A inspeção real foi executada com Google Chrome 151.0.7922.138 em contexto Playwright isolado. As 11 rotas passaram em desktop (1440×1000) e celular (390×844): 22/22 cenários com HTTP 200, console e erros de página vazios, sem requisições falhas ou overflow horizontal. Tema escuro e persistência após recarga também passaram. As capturas e métricas estão em `docs/evidencias/integracao-2019-english-lote-001/`.

Próxima seção exata: `BBC_English_Plus_transcricoes_PT_EN.md — Unidade 1`.

## Publicação

Cada lote exige auditoria estrutural, interação, JSON/JavaScript, rotas locais e públicas, inspeção desktop/celular, `git diff --check`, revisão de direitos/segredos, commit único, push normal e confirmação do SHA implantado no GitHub Pages.
