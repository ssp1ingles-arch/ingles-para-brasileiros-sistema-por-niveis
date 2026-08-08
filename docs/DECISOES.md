# Decisões

- Dados didáticos ficam em JSON; HTML apenas apresenta.
- O primeiro lote forma uma sequência A1 curta e testável: pronomes → artigos → tempo → lugar.
- Arquivos foram divididos internamente; apenas seções compatíveis foram publicadas.
- Explicações condensadas estão marcadas como editoriais em `observacao_uso`.
- Nenhum arquivo fonte ou projeto anterior foi modificado.
- No lote 005, `not only ... but also` não foi concentrado em um nível: correlação simples ficou em B1, variações/paralelismo em B2 e inversão inicial formal em C1.
- Pares `_S001` entre 0113 e 0170 só foram consolidados após igualdade do corpo normalizado; os hashes e as justificativas ficam na triagem.
- Não houve redistribuição artificial para equilibrar contagens. A1 recebeu apenas fundamentos e rotinas imediatas; B1/B2 receberam contraste, opinião, fala conectada, modais no passado e usos polissêmicos.
- C2 e Kids permaneceram vazios porque as fontes do intervalo não oferecem material legítimo para esses públicos.
- A2 não usa mais uma grade plana: níveis com mais de 30 unidades são agrupados em seções recolhíveis por subpainel, sem quebrar anterior/próxima na ordem pedagógica global.

## Lote 006 — habilidades e ordens

- Critério da habilidade principal: objetivo didático, tipo, tema, explicação, conteúdo, exemplos, justificativa CEFR, painel e amostra da fonte. O painel sozinho não decide a classificação.
- Antes da auditoria, a principal inferida pelo primeiro rótulo era: Gramática **161**, Verbos **140**, Conversação **63**, Vocabulário **17**, Pronúncia **7**.
- Depois da migração das 388 unidades: Gramática **160**, Verbos **136**, Conversação **67**, Vocabulário **17**, Pronúncia **8**.
- **5 unidades** mudaram de principal. Exemplos representativos: conteúdo de fala conectada passou a Pronúncia; expressões destinadas ao uso interativo passaram a Conversação; quadros cujo foco é padrão verbal permaneceram em Verbos.
- O relatório reproduzível e a amostra estão em `dados/auditoria-habilidades-006.json`.
- O lote 006 terminou com 465 unidades: principais Gramática **184**, Verbos **175**, Conversação **75**, Vocabulário **23** e Pronúncia **8**.
- `habilidades` foi preservado para compatibilidade, sempre começando pela principal; o modelo normativo agora é `habilidade_principal` + `habilidades_secundarias`.
- Foram formalizadas quatro ordens: `ordem_global`, `ordem_nivel`, `ordem_painel` e `ordem_subpainel`. O validador rejeita ausência, duplicidade no escopo e pré-requisito posterior.
- `0171` não recebeu B2: a fonte mostra complementos e flexão, mas não explica nuance semântica ou mudança de registro suficiente para justificar esse nível.
- C2 e Kids continuam vazios por falta de material legítimo no intervalo.

## Lote 007 — consolidação e interface

- Os 203 subpainéis existentes foram auditados por nível, painel, tema, ordem e pré-requisitos. A consolidação produziu 56 grupos; nove agrupamentos legítimos foram acrescentados pelo conteúdo novo, totalizando 65.
- IDs antigos continuam aceitos por `dados/compatibilidade-subpaineis.json`; o estado salvo em `nivelGroupState` é migrado para o destino consolidado.
- Exceções abaixo de quatro unidades foram mantidas somente quando o painel inteiro ainda é pequeno ou quando a habilidade é independente e não pode ser fundida sem perder significado.
- Busca e filtros nunca removem a estrutura de subpainéis. O filtro de painel combina com habilidade principal/secundária, e anterior/próxima segue a ordem global do conjunto filtrado.
- `0318` não foi publicado: o texto OCR isolado contém corrupção suficiente para tornar exemplos e formas verbais inseguros.
- Uma regressão de codificação detectada nas capturas A2–C1 foi corrigida no gerador com leitura UTF-8 explícita e revalidada visualmente.

## Lote 008 — estudo ativo

- A imagem 0318 foi lida em resolução integral. Todas as 20 linhas foram confirmadas; a ordem correta é passado em Yesterday, presente em Today e `will` em Tomorrow.
- O modo português → inglês só aceita pares completos e diretos. Traduções editoriais genéricas e a descrição visual da 0318 são excluídas desse modo.
- “Repetir” reinsere o cartão no fim da fila; os demais intervalos-base são 2, 5 e 12 dias, ampliados pela sequência positiva e limitados a multiplicador 4.
- O novo histórico usa `studyProgressV1` e `studySessionV1`. As chaves anteriores (`nivelState` e `nivelGroupState`) não foram transformadas nem apagadas.
- Os 65 subpainéis anteriores preservaram IDs e conteúdo. Nove destinos foram acrescentados porque representam habilidades independentes em níveis antes sem agrupamento correspondente; nenhum subpainel existente foi fundido, renomeado ou removido.
- C2 e Kids continuaram vazios porque o intervalo não contém material legítimo para esses níveis/públicos.

## Lote 009 — Jornada Guiada

- A jornada é recomendação, não bloqueio. Todas as unidades permanecem acessíveis.
- Módulos usam até 12 unidades; módulos menores são aceitos no fechamento de etapas e no C1, que possui apenas oito unidades legítimas.
- O percentual usa somente unidades concluídas. Dominadas e revisões vencidas vêm do histórico de estudo existente.
- Nenhuma dependência foi criada para fabricar sequência; a auditoria manteve as 78 dependências válidas já existentes.
- Os 74 subpainéis foram reutilizados integralmente, sem fragmentação nova.

## Lote 010 — cobertura curricular

- A matriz mede construção curricular, não certificação CEFR. Quantidade só resulta em “substancial” quando acompanhada por variedade temática.
- A auditoria manteve as 339 unidades de Verbos: nenhuma reclassificação foi feita para melhorar números. Grupos numerosos ficaram sinalizados para revisão editorial individual.
- Fontes com transcrição receberam Escuta como principal quando a compreensão oral é o objetivo; o sistema informa que o áudio não está incluído.
- Dez fontes posteriores foram concluídas antecipadamente para cobrir lacunas; seus números e hashes impedem reprocessamento futuro.
- Cinco subpainéis foram acrescentados para habilidades independentes de Escuta e novos destinos legítimos. IDs anteriores e 102/102 IDs de jornada permaneceram estáveis.
- C2 e Kids continuam vazios por ausência de evidência legítima nas fontes tratadas.

## Lote 011 — modo Prática

- Atividades objetivas usam somente frase, tradução ou estrutura exata da unidade. Não existem distratores inventados.
- Lacunas são limitadas a alvos inequívocos (`a/an/do/does/did`); produção aberta usa autorrevisão, nunca correção automática.
- Erros enviam a unidade para `studyProgressV1` como aprendizagem/revisão sem apagar conclusão ou histórico.
- Treze unidades foram excluídas por não oferecerem resposta inequívoca; exclusão é preferível a exercício ruim.
- A Jornada ganhou “Praticar etapa” reutilizando IDs da etapa; 102 IDs anteriores permaneceram estáveis.

<!-- LOTE-012-DECISOES:INICIO -->
## Decisões do lote 012

- Não criar unidade isolada para `have dinner`: 0541 é duplicata normalizada de 0179.
- Remover todas as 371 lacunas: o gerador anterior retirava apenas `a/an/do/does/did`, sem alvo inequívoco relevante.
- Não inventar alternativas; quatro pareamentos duplicados e duas reordenações inconsistentes foram removidos.
- Ativar Kids somente com material explicitamente infantil e `nivel_cefr`.
- Ativar C2 apenas para transferência de registro, estilo, reformulação e idiomaticidade comprovadas.
- Manter três OCRs corrompidos como parciais, sem forçar publicação.
<!-- LOTE-012-DECISOES:FIM -->

<!-- LOTE-013-DECISOES:INICIO -->
## Decisões do lote 013

- Não inferir particípios nem a pronúncia encoberta de TAKE/TOOK nas imagens.
- Tratar 0601 como duplicata integral de 0070 e publicar somente o contraste novo de 0602.
- Rejeitar prompts, conselhos e motivação como conteúdo didático de inglês.
- Consolidar subpainéis por função pedagógica, mantendo aliases dos IDs antigos.
- Dividir fontes extensas por habilidade; nunca despejar o livro inteiro em um painel.
<!-- LOTE-013-DECISOES:FIM -->

<!-- LOTE-014-DECISOES:INICIO -->
## Decisões do lote 014

- Consolidar 0681 em B2-L7-0308-01 e C1-L7-0308-02, preservando registro, pontuação e i.e. × e.g.
- Corrigir baixo rendimento quando a canônica apresenta bloco completo novo, não apenas exemplo adicional.
- Manter compilações sem unidade agregadora quando suas partes já estão integralmente distribuídas.
- Não criar subpainel para uma única fonte; as dez unidades usam agrupamentos existentes.
- Criar atividade somente quando há modelo inequívoco verificável.
<!-- LOTE-014-DECISOES:FIM -->

<!-- LOTE-015-DECISOES:INICIO -->
## Decisões do lote 015

- Não republicar gonna/wanna/gotta/kinda; anexar 0781 à canônica e preservar restrições de fala informal.
- Manter 14 unidades complementares fora da Jornada com motivo individual.
- Excluir atividade quando leitura/escrita aberta ou precisão avançada admite múltiplas respostas.
- Preservar os 95 subpainéis e todos os IDs anteriores.
<!-- LOTE-015-DECISOES:FIM -->

<!-- LOTE-016-DECISOES:INICIO -->
## Decisões do lote 016

- Encerrar em 0920 devido ao volume de livros extensos.
- Não classificar conteúdo escolar de literatura automaticamente como ensino de inglês ou Kids.
- Dividir 0881/0882 em leitura B1, escrita B2 e retórica C1.
- Manter respostas abertas fora das atividades e da Jornada principal.
- Preservar 95 subpainéis.
<!-- LOTE-016-DECISOES:FIM -->

<!-- LOTE-017-DECISOES:INICIO -->
## Decisões do lote 017

- Não republicar cem fontes integralmente idênticas.
- Preservar exemplos, páginas e destinos através da procedência anexada.
- Não executar amostragem dirigida com livros avançados extensos quando isso comprometeria a leitura integral.
- Manter unidades, atividades, Jornada e 95 subpainéis inalterados.
<!-- LOTE-017-DECISOES:FIM -->

<!-- LOTE-018-DECISOES:INICIO -->
## Decisões do lote 018

- Confirmar a amostra do lote 017 somente por igualdade do corpo integral normalizado.
- Consolidar compêndios de estruturas, preposições e quantificadores sem criar painéis ou micro-unidades.
- Não converter índice, regras administrativas ou teste de nivelamento em lições/atividades.
- Corrigir duas duplicações exatas preexistentes de exemplos, mantendo a ocorrência pedagogicamente canônica.
- Preservar 95 subpainéis, Jornada, atividades e localStorage.
<!-- LOTE-018-DECISOES:FIM -->

<!-- LOTE-019-DECISOES:INICIO -->
## Decisões do lote 019

- Encerrar em 1162 antes do novo painel e da série de livros extensos.
- Tratar 1121–1161 como duplicatas somente após igualdade integral normalizada.
- Distribuir 1162 em 104 destinos existentes, sem painel por fonte ou micro-unidade.
- Preservar integralmente Jornada, atividades, subpainéis e localStorage.
<!-- LOTE-019-DECISOES:FIM -->

<!-- LOTE-020-DECISOES:INICIO -->
## Decisões do lote 020

- Criar unidades por objetivo pedagógico, nunca por conversa, expressão ou livro.
- Rejeitar 1165, 1167 e 1169 como lições por serem índices/regras.
- Mapear individualmente as 1.006 dicas de 1170 em dois objetivos transversais B1/B2.
- Manter as dez unidades novas complementares e sem atividade automática por admitirem respostas abertas.
<!-- LOTE-020-DECISOES:FIM -->

<!-- LOTE-021-DECISOES:INICIO -->
## Decisões do lote 021

- Corrigir a compressão excessiva das 1.006 dicas de 1170 e separar consolidação, incorporação e descarte.
- Manter as dez unidades do lote 020 complementares após auditoria individual.
- Tratar 1176 por suas 367 páginas, separando conteúdo linguístico de metodologia.
<!-- LOTE-021-DECISOES:FIM -->

<!-- LOTE-022-DECISOES:INICIO -->
## Decisões do lote 022

- Consolidar 1177, 1179 e 1181 somente após igualdade integral do corpo e do hash normalizado.
- Preservar 1178 e 1180 como antecipadamente concluídas, sem republicação.
- Mapear as 201 páginas de 1182, separando conteúdo linguístico de método, motivação, tutorial e material editorial.
<!-- LOTE-022-DECISOES:FIM -->

<!-- LOTE-023-DECISOES:INICIO -->
## Decisões do lote 023

- Consolidar 1183 como duplicata integral de 1182 e 1185 como duplicata integral de 1184.
- Mapear 1184 por suas 121 seções textuais, registrando sete páginas sem texto ausentes no Markdown.
- Separar vocabulário, datas, formação de palavras, verbos e exemplos reais das técnicas de memorização e material editorial.
<!-- LOTE-023-DECISOES:FIM -->

<!-- LOTE-024-DECISOES:INICIO -->
## Decisões do lote 024

- Mapear as 285 páginas de 1186 antes de abrir 1187.
- Separar explicações e exemplos linguísticos de páginas editoriais, Attitude, conselhos e autobiografia.
- Consolidar 1187 somente após a validação intermediária e a igualdade integral com 1186.
- Encerrar antes de 1188_REGRAS_6.md.
<!-- LOTE-024-DECISOES:FIM -->

<!-- LOTE-025-DECISOES:INICIO -->
## Decisões do lote 025

- Aplicar 1188 como fonte normativa, sem criar conteúdo didático independente.
- Mapear as 361 páginas presentes de 1189, registrando honestamente a ausência da página 2.
- Manter no repositório somente metadados, decisões e destinos, sem páginas ou exemplos integrais do livro.
- Comparar 1190 somente após a validação intermediária 12/12 de 1189.
- Encerrar antes de 1191.
<!-- LOTE-025-DECISOES:FIM -->

<!-- LOTE-026-DECISOES:INICIO -->
## Decisões do lote 026

- Mapear integralmente 1191 antes de abrir 1192.
- Registrar 78 unidades temáticas e cada página sem copiar listas, exercícios, respostas ou imagens.
- Relacionar ensino, exercícios e respostas a unidades existentes; usar a lista alfabética somente para cobertura.
- Consolidar 1192 apenas depois da validação intermediária 17/17.
- Encerrar antes de 1193.
<!-- LOTE-026-DECISOES:FIM -->

<!-- LOTE-027-DECISOES:INICIO -->
## Decisões do lote 027

- Mapear 1193 antes de abrir 1194.
- Não converter exercícios ou respostas em atividades.
- Classificar 1194 como sobreposição extensa/extração alternativa, não duplicata integral.
- Encerrar antes de 1195.
<!-- LOTE-027-DECISOES:FIM -->

<!-- LOTE-028-DECISOES:INICIO -->
## Decisões do lote 028

- Mapear 1195 integralmente antes de abrir 1196.
- Não converter exercícios ou respostas em atividades.
- Classificar 1196 como Course Book complementar independente, não duplicata de 1195.
- Consolidar explicações em destinos existentes sem republicá-las.
- Encerrar antes de 1197.
<!-- LOTE-028-DECISOES:FIM -->

<!-- LOTE-029-DECISOES:INICIO -->
## Decisões do lote 029

- Classificar 1197 como índice/hub editorial, sem conteúdo didático independente.
- Consolidar os 36 temas e 191 itens de 1198 nos destinos já associados à fonte canônica 1189.
- Consolidar os 14 temas de 1199 nos destinos da fonte canônica 1191 e registrar 150 itens reais contra 140 declarados no cabeçalho.
- Classificar 1198 e 1199 como obras independentes, não duplicatas.
- Encerrar antes de 1200.
<!-- LOTE-029-DECISOES:FIM -->

<!-- LOTE-030-DECISOES:INICIO -->
## Decisões do lote 030

- Consolidar 1200 e 1201 como extrações HTML temáticas independentes dos Practice Books Levels 1 e 2.
- Relacionar 1200 à fonte canônica 1193 e 1201 à 1195.
- Não republicar frases, traduções, exercícios, respostas ou a tabela Review.
- Preservar currículo e experiência; encerrar antes de 1202.
<!-- LOTE-030-DECISOES:FIM -->

<!-- LOTE-031-DECISOES:INICIO -->
## Decisões do lote 031

- Classificar 1205 e 1206 após leitura do Markdown e inspeção visual das imagens somente leitura.
- Consolidar 1205 no futuro planejado com going to e 1206 nos usos fundamentais de would.
- Tratar as fontes como fragmentos complementares com sobreposição editorial, não duplicatas.
- Descartar aproximações fonéticas não padronizadas, créditos e identificadores; não publicar imagens ou frases.
- Encerrar antes de 1207.
<!-- LOTE-031-DECISOES:FIM -->
