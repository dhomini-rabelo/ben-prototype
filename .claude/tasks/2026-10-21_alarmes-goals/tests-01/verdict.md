# Verdict consolidado - system-test-01 (alarmes-goals)

Fontes: verdict-a.md (1-2), verdict-a2.md (3-5, 10), verdict-b.md (6-9). Premissa geral: servidor com relogio real (21-22/10), browser com clock fake; datas do roteiro mapeadas para 22/10 em diante.

1. Settings > Lembretes (manha 08:00, resumo 08:00, persistencia apos reload): PASS
2. Captura por texto/LLM de alarme com avisos (dentista; contadora com 2 avisos + evento; menu lista): PASS (obs: "um dia antes" do dentista ja passado, Ben avisou; body do alarme vaza texto do modelo, lead em a2)
3. Popup do alarme; Adiar mostra 10 min, 30 min, 1 h, 2 h + outro horario (amanha de manha omitido por passar do evento): PASS
4. Resumo diario 08:00 lista o dentista e popup do alarme; outro horario 16:40: PASS
5. 16:40 popup; Adiar mostra so 10 min (dinamico); Concluir: PASS
6. Goal capturado: Ben pergunta, usuario confirma, goal com 2 mensagens e weekdays 1-5: PASS
7. Popup do goal com as 2 mensagens; Feito reagenda proximo dia: PASS
8. Conditional "visitar minha mae" capturado: PASS
9. Check-in "Ja aconteceu?"; frequencia semanal no modal; Ainda nao; +1 dia nada; +7 dias pergunta; Sim conclui e sai dos ativos: PASS
10. Resumo 07:30 aparece no horario; switch desligado e o resumo some: PASS

Observacoes nao bloqueantes: titulo truncado na lista (menu-list-row.tsx:64-90), ISO cru no card do chat, popup day-before sem data, contador do menu (detalhes em verdict-a2.md e verdict-b.md).

PASS
