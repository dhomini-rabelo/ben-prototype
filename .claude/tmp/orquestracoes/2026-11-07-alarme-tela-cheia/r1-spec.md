veredito: ok

Decisão: .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/decisao.md (veredito `vai menor`; decisão do usuário pendente, vai junto do gate da spec)
Spec:    .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/spec.md (sem `## Gate`)
Contagem: AC 15 (AC-001..AC-015, 4 em `Continua como hoje`), RT 12, CB 13, PR 8 (PR-008 geral). `[Visual]` presente. Quebra: não proposta (ver Premissas).

## Resumo para o gate
Decisão: vai menor — Android por APK e só lembretes de horário agora; iOS (AlarmKit), missão e Play Store ficam para depois do sinal medido.
- Na hora do lembrete de horário, a tela do Android acende e a tela de alarme ocupa tudo, por cima do bloqueio, sem desbloquear.
- Toca som de alarme em loop, no volume de alarme, mesmo no silencioso, até Parar, Soneca ou Concluir; teto de 10 min, depois vira "alarme perdido" (sugestão do agente).
- Soneca usa as opções de hoje (10 min a amanhã de manhã); sem rede, adia 10 min e envia depois.
- Com o app aberto (Android e web), a mesma tela substitui o painel pequeno; na web, em até 15 s e com som só após um clique na página.
- Fica igual: meta e condicional no painel de hoje, resumo diário, criar/editar lembretes; sem a tela cheia liberada, a notificação comum de hoje.
- Exige do celular: Android com APK novo; no Android 14+ liberar "tela cheia" nas configurações (o app pede uma vez e mostra o estado nas configurações de lembretes).
- O servidor passa a guardar a hora de cada ação, para medir quantos alarmes são atendidos em até 5 min.

## Perguntas do gate

### 1. Lib nativa do alarme (regra 7 de [Requisitos técnicos]: dependência nova recusável)
Texto: A tela cheia por cima do bloqueio e o som de alarme em loop não existem no expo-notifications. Como entregar a parte nativa do Android?
Header: Lib alarme
Opções:
- notify-kit (recomendada) — Usa react-native-notify-kit, fork mantido do Notifee para New Architecture: tela cheia, ações e alarme exato prontos. Lib nova de um mantenedor; compatibilidade com Expo 54 é conferida no reconhecimento.
- Módulo próprio — Código nativo Kotlin no repositório (serviço de som, tela sobre o bloqueio), sem lib nova. Controle total, mas custo e manutenção nativa bem maiores.
- Sem tela cheia — Só expo-notifications com canal de alarme: notificação com som de alarme, sem tela por cima do bloqueio. Corta AC-001 e AC-009 e não resolve o pedido.

## Premissas
- Quebra não proposta: o alarme nativo e o app aberto abrem a mesma tela de alarme (AC-003, AC-005 a AC-008 compartilhadas) e os RTs nativos dependem dessa tela existir; pelo critério da Etapa 4 não há duas partes independentes.
- Cada aviso do lembrete de horário (na hora, minutos antes, manhã do dia, véspera) toca como alarme em tela cheia (AC-004, agente); alternativa seria só o aviso "na hora".
- "Parar" é o "OK" de hoje (acknowledge sem soneca); "Concluir" é o `status: done` de hoje (lido em alarm-popup-overlay.tsx).
- Sem a tela cheia liberada, o lembrete de horário segue no canal `alarmes` de hoje, com o mesmo som (AC-013), seguindo a resposta "se não liberar, notificação comum"; não pus o som de alarme em loop nesse caso. Com a tela liberada mas o celular em uso, o Android mostra aviso no topo com o som de alarme (CB-003).
- Tocar na notificação comum (ou na de alarme perdido) abre a tela de alarme sem som (CB-001, CB-009): a pessoa já está olhando.
- Teto de 10 min de som por disparo (RT-011, CB-009, AC-002), apesar da resposta "até parar ou adiar": está marcado (agente) para o usuário aceitar ou cortar no gate.
- Soneca sem limite de vezes (CB-005); limite tipo Alarmy está em Fora de escopo.
- O alarme aparece por cima do resumo diário (CB-011); hoje o popup espera o resumo fechar (alarm-popup-overlay.tsx, `isSummaryOpen`).
- O título do lembrete aparece sobre a tela de bloqueio, como em despertadores (sem modo privado).
- Sinal de sucesso: o briefing diz que o acknowledge "já registra", mas o código guarda só `acknowledgedUntil = firedAt` (acknowledge-reminder.ts) e o modelo não tem data de atualização; por isso RT-009 (registrar instante da ação) entrou como requisito da menor versão, não como pergunta, porque não traz custo nem dependência recusável.
- "Forçar parada" do Android cancela alarmes do app; ficou em Fora de escopo. Reinício do celular está coberto (RT-005, CB-004).
- Som: arquivo próprio embutido no app, de licença livre (RT-004); a escolha do arquivo fica para o plano.
- Prova no Android sem aparelho/emulador: teste unitário + `(sem captura)` (PR-001, PR-007, PR-008); se o plano achar emulador Android disponível, pode somar vídeo, sem trocar a marca da spec.
- Incertezas da pesquisa que o reconhecimento (4.1) precisa fechar: som com `USAGE_ALARM` no silencioso (RT-004), loop de som no notify-kit, compatibilidade do notify-kit com Expo 54 + expo-notifications juntos.
- Plataforma do protótipo: Android 390x844 renderizado no app web (:8081), conforme briefing.
- Lembretes de memória business-rules v1 ("sem OS notification", "alarmes mockados") tratados como históricos, conforme r0-mobile.
