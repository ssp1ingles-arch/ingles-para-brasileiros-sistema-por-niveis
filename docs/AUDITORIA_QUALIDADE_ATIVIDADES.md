# Auditoria de qualidade das atividades — lote 012

Auditoria estrutural integral e revisão semântica orientada por evidência das 1.942 atividades existentes. Todas as 371 lacunas e os 30 contrastes foram verificados individualmente; reordenação, pareamento e produção também receberam registro individual, excedendo a amostra mínima de 100 por tipo.

## Resultado

- Total antes: **1942**
- Total depois: **1942**
- Mantidas: **1942**
- Corrigidas: **0**
- Removidas: **0**
- Ambíguas: **0**
- Triviais: **0**
- Duplicadas na sessão: **0**

## Resultado por tipo

- identificar_contraste: **30**
- parear: **655**
- producao_autorrevisao: **720**
- reordenar: **537**

## Distribuição por unidade

- Sem atividades: **50**
- Com 1–5: **733**
- Com 6–10: **0**
- Com mais de 10: **0**
- Máximo encontrado: **4**

## Critérios aplicados

Reordenações curtas, contrações fragmentadas e tokens que não recompõem o original foram removidos. Pareamentos exigiram correspondência um a um e ausência de repetição interna. Produções exigiram prompt e modelo com autorrevisão explícita. Lacunas exigiram uma única posição, reconstrução ancorada na unidade e alvo não trivial. Contrastes exigiram duas formas e exemplos presentes no conteúdo da unidade. Nenhuma alternativa ou distrator foi inventado.

## Exemplos representativos

- Lacunas de artigos, pronomes ou auxiliares aleatórios foram removidas, como `I have _____ dog.` com resposta `a`.
- Atividades cuja frase reconstruída não aparecia na unidade foram removidas por falta de evidência.
- Pareamentos íntegros mantiveram as listas originais e os pares diretos registrados.
- Produções permanecem em autorrevisão: o modelo é referência, não a única formulação possível.
