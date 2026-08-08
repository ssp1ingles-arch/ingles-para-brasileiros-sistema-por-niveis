# Jornada Guiada

As jornadas A1–C1 referenciam IDs das unidades; C2 e Kids não recebem jornadas vazias. A estrutura é nível → etapas → módulos → unidades. Etapas seguem função comunicativa, painéis, subpainéis, habilidade e ordem pedagógica; módulos têm objetivo coerente e normalmente até 12 unidades. Exceções pequenas ocorrem apenas em C1 e no fechamento de etapas.

O progresso do nível é `unidades concluídas ÷ unidades da jornada`. Etapas só contam como concluídas quando todas as suas unidades estão concluídas. Estados vêm de `nivelState` e `studyProgressV1`; não há esquema paralelo.

“Continuar jornada” prioriza: revisão vencida na etapa atual; primeira incompleta com pré-requisitos atendidos; primeira incompleta da etapa; próxima etapa; revisão geral. Os rótulos são recomendações visuais e nenhuma unidade é bloqueada. “Revisar etapa” abre `estudar.html` com os IDs da etapa, reutilizando o agendamento existente.

A auditoria em `dados/auditoria-prerequisitos-009.json` verificou ciclos, dependências posteriores, cadeias longas e excesso. A limitação atual é que as jornadas refletem o conteúdo já publicado e serão regeneradas quando novos níveis ou habilidades legítimas entrarem.
