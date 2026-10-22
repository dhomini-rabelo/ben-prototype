# Verdict A2 (continuacao: passos 3, 4, 5 e 10)

Veredito da continuacao: PASS nos passos 3, 4, 5 e 10 (passos 1 e 2 PASS em verdict-a.md). Achados abaixo sao leads/observacoes, nao falhas do roteiro.

## Premissas assumidas
- Servidor usa relogio real (21-22/10 de madrugada UTC); relogio do browser e fake (Playwright clock). O roteiro "hoje 17:00" virou 22/10 (dentista = evento 22/10 17:00, aviso morning-of 08:00 22/10).
- Linha do tempo: 22/10 08:00 BRT (11:00Z), 22/10 16:40 BRT (19:40Z), 23/10 07:30 BRT (10:30Z), 24/10 07:30 BRT. Apos setSystemTime usei fastForward(20000).

## Passos
- Passo 3/4 (08:00 de 22/10): resumo "seu dia" abriu com ALARMES > Consulta no dentista 17:00 (a2-01-0800.png). Entendi -> popup ALARME "Consulta no dentista, as 17:00" com OK/Adiar/Concluir (a2-02). Adiar mostra 10 min 08:10, 30 min 08:30, 1 h 09:00, 2 h 10:00 + Outro horario; "amanha de manha" corretamente ausente (cairia depois do evento 17:00) (a2-03). Outro horario abre seletor (default 09:05, passo de 5 min); ajustei para 16:40 (a2-04, a2-05) e Adiar: API /reminders/list devolveu snoozedUntil=nextFireAt=2026-10-22T19:40Z (16:40 BRT). PASS.
- Passo 5 (16:40 de 22/10): popup do dentista; Adiar mostra SO "10 min 16:50" + Outro horario (30 min/1 h/2 h sumiram, pois passariam das 17:00) (a2-07, a2-08). Concluir: reminder status=done, completedAt gravado (a2-09). PASS. Antes dele apareceu o popup da contadora (aviso day-before das 15:00 de 22/10, atrasado): comportamento coerente (catch-up), OK dispensou.
- Passo 10: Settings > Lembretes, Horario do resumo 08:00 -> 07:30 (hora diminuir 1x, minuto aumentar 6x); GET /user-preferences/detail: dailySummaryTime 07:30 (a2-10). Relogio 23/10 07:29:50 -> sem resumo; apos 07:30 -> "seu dia / ALARMES / Reuniao com a contadora 15:00" (a2-11). Desliguei o switch (dailySummaryEnabled=false no GET, a2-12); 24/10 07:30 -> nenhum resumo (so o popup de alarme atrasado da contadora, que e alarme e nao resumo) (a2-13). PASS.
Screenshots: .claude/tasks/2026-10-21_alarmes-goals/tests-01/screenshots/a2-*.png (a2-10b-overlay.png e o seletor de settings aberto).

## Achados com pistas
1. Body do alarme com texto do modelo (dentista: "O aviso de um dia antes seria em ... por isso nao foi incluido"). Causa provavel (lida no codigo): o prompt oferece o campo `notes` por lembrete sem restringir seu uso (packages/infra/adapters/src/services/ben-agent-provider/generate-reply/system-prompt.ts:103; schema notes: z.string().nullable() em generate-reply/schemas.ts:17); persist-captures grava `draft.notes` sem filtro (packages/domain/chat/src/application/use-cases/captures/persist-captures.ts:86) e o campo reaparece como `body` no list (confirmado via GET /reminders/list). O modelo usa `notes` para explicar o descarte do aviso. Nao validei a leitura do mapeamento notes->body no dominio.
2. Titulo truncado "R..." na lista de Lembretes: MenuListRow poe titulo `flex-1` com numberOfLines={1} na mesma linha do badge e do `trailing` shrink-0 (packages/infra/mobile/ben/src/layout/components/menu-list/menu-list-row.tsx:64-90); o trailing do lembrete (firesAtRelative) e largo e esmaga o titulo. Lista em menu-reminders-list.tsx:46-58.
3. Observacao: card LEMBRETE no chat mostra o ISO cru ("2026-10-22T17:00:00-03:00") em vez de data formatada (a2-01-0800.png). Nao investigado.
4. Observacao: menu mostrava "Lembretes 2" logo apos concluir o dentista (outro ainda ativo + dentista done); nao verifiquei se o contador inclui done (nao investigado).
5. Observacao: popup do aviso day-before mostra "as 15:00" (horario do evento) sem a data (evento e dia seguinte), pode confundir; nao investigado.

## Ambiente
Servidores seguem no ar: server-ben 3335, proxy 3334, Expo 8082. Estado do DB de teste: dentista done; contadora ativa (nao reconhecida); prefs summary 07:30 desligado, manha 08:00. Browser Playwright com clock em 24/10 07:30 BRT.
