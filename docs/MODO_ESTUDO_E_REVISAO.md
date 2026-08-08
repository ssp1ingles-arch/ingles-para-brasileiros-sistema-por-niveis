# Modo Estudar e revisar

O modo de estudo usa somente unidades publicadas e funciona integralmente no navegador, sem conta, servidor ou banco externo.

## Sessões

É possível filtrar por nível, painel, subpainel, habilidade principal, favoritos, unidades novas ou revisões vencidas. Revisões vencidas entram primeiro; as demais unidades completam o limite escolhido. A fila, a posição, o modo e o progresso ficam em `studySessionV1`, permitindo encerrar, recarregar e continuar.

Os modos seguros são inglês → português, português → inglês, conceito → exemplos e autorrevisão. Português → inglês aceita apenas unidades com correspondência direta, completa e não editorial entre `conteudo_en` e `traducoes`. Não há alternativas erradas nem distratores inventados.

## Agendamento

O histórico fica em `studyProgressV1`, indexado pelo ID estável da unidade. Cada registro contém `firstStudy`, `lastReview`, `nextReview`, `reviews`, `lastRating`, `streak` e `state`.

- Repetir: reaparece no fim da sessão e volta em 1 dia.
- Difícil: intervalo-base de 2 dias.
- Bom: intervalo-base de 5 dias.
- Fácil: intervalo-base de 12 dias.

Depois da primeira avaliação positiva, o intervalo-base é multiplicado por `1 + 0,35 × (sequência − 1)`, limitado a 4. “Repetir” zera a sequência. A unidade fica `learning` na primeira avaliação ou após “Repetir”, passa a `review` nas revisões seguintes e vira `dominated` após pelo menos três avaliações positivas consecutivas terminando em “Fácil”.

## Compatibilidade

O modo usa chaves novas e não altera `nivelState`, `nivelGroupState` ou outros dados existentes. Favoritos são lidos de `nivelState`; concluídas, posição, filtros e estado dos subpainéis permanecem intactos. IDs de unidades e o mapa de compatibilidade de subpainéis continuam estáveis.
