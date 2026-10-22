# Verdict B (passos 6 a 9) - PASS

Ambiente reaproveitado de verdict-a.md (3335, 3334, 8082 ja no ar). LLM real via POST /chat. Browser 390x844, TZ America/Sao_Paulo, clock fake iniciado em 2026-10-22 10:00 BRT.

## Premissas
- Servidor usa relogio real (21/10 ~21:05 BRT); o browser usa clock fake. Logo "proximo dia util 11:00" = 22/10 11:00 e "amanha 08:00" do condicional = 22/10 08:00 (ja passado no clock do browser, o popup apareceu no catch-up). +1 dia e +7 dias contados a partir desse nextFireAt (23/10 e 29/10 08:00 BRT).
- Os popups sao bottom sheets que nao aparecem no innerText simples; usei screenshot.

## Passos
- Passo 6 (PASS): "quero ir a academia as 11h de segunda a sexta; me lembra que treinar me da energia e que preciso resolver a dor nas costas". O Ben NAO gravou de imediato, perguntou "quer salvar como objetivo ... com as mensagens ...?" (b01-goal-pergunta.png). Apos "sim, pode salvar", respondeu "Objetivo salvo" com card (b02-goal-criado.png). GET /reminders/list: kind=goal, recurrence weekdays [1..5], firesAt 22/10 11:00-03:00, messages ["treinar me da energia","preciso resolver a dor nas costas"].
- Passo 7 (PASS): 22/10 11:00 BRT: popup GOAL "Ir a academia, as 11:00" com "O QUE VOCE SALVOU PARA ISSO" e as 2 mensagens, botoes Feito/Adiar (b03b-popup-goal.png). Feito: goal segue active com nextFireAt 23/10 11:00 BRT (recorrente avancou), b04-goal-feito.png.
- Passo 8 (PASS): "visitar minha mae quando ela voltar a cidade" -> kind=conditional, sem horario, checkFrequency daily, nextFireAt 22/10 08:00 BRT (b05-conditional-chat.png).
- Passo 9 (PASS): popup CHECK-IN "Ja aconteceu? Visitar minha mae ..." com seletor diaria/2 dias/3 dias/semanal e Sim/Ainda nao (b06). Trocar para semanal (b07) e "Ainda nao": API checkFrequency weekly, nextFireAt 29/10 08:00 BRT (b08). +1 dia (23/10 08:00): nenhum check-in (so o popup do alarme da contadora, esperado) (b09, b10). +7 dias (29/10 08:00): check-in aparece de novo (b11). "Sim": status done/completedAt gravado (b12); Menu > Lembretes lista o condicional em CONCLUIDOS e fora de ATIVOS (b13-lista-ativos.png).
Screenshots: .claude/tasks/2026-10-21_alarmes-goals/tests-01/screenshots/b*.png

## Observacoes (leads, nao falhas)
- Card LEMBRETE no chat mostra ISO cru (2026-10-22T11:00:00-03:00) para o goal, e o card do condicional vem sem data (ja anotado em a2).
- Resposta do Ben diz "comecando amanha" com firesAt 22/10 (correto pelo relogio do servidor); sem impacto.
- Apos 7 dias de clock fake, o popup do goal atrasado aparece (catch-up) e bloqueia o botao Menu ate ser tratado; comportamento coerente, mas e uma pilha de popups.
- Lista de ativos mostra goal como "em 2h" apos Feito sob clock fake; nao investigado.
