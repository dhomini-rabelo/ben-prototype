# Revisão do plano — rodada 3 — alarme-tela-cheia

## Veredito
aprovado

## Convenções carregadas
- Não recarreguei skills: o escopo desta rodada é só a `## Lista da volta 2` (passos 1, 4, 26, 28, 29, 35, 37
  e a linha de `snoozeAlarm` em `## Contratos`). As convenções aplicáveis já foram carregadas e citadas nas
  rodadas 1 e 2. São elas: `code-write-code` (`domain-entity-declaration.md`, `automated-testing.md`,
  `frontend-code-preferences.md`, `mobile-bottom-sheet-overlay.md`) e `code-get-coding-designs`
  (`mobile-services-layer-structure.md`), mais o `/CLAUDE.md` e o `projeto.md`.
- Conferido no disco: `src/prototipo/alarme-tela-cheia/` (`settings-row.tsx`, `variacao-1.tsx`, `variacao-4.tsx`,
  `duration-slider.tsx`, `parts.tsx`, `shared.tsx`, `strings-v4.ts`) e `app/prototipo/alarme-tela-cheia/v4.tsx`
  existem; `menu-settings/reminders-settings-section.tsx` e `strings/settings-strings.ts` existem.

## Bloqueios
nenhum

## Notas
- plano.md:347-348 (passo 35): sobra um `)` sem abertura depois de "que o passo 37 apaga". É só pontuação e
  não muda o que se executa.

## Bloqueios da rodada anterior
1. `fullScreen` da soneca vindo do store vazio no background → **corrigido**.
   - plano.md:289-293 (passo 26): `snoozeAlarm` reagenda com
     `scheduleReminderAlarm({ reminderId, firedAt: snoozeUntil, title, kind }, await getFullScreenPermission())`
     e proíbe ler o `alarm-permission-store`. A regra vale para todo chamador fora do sync.
   - plano.md:301-303 (passo 28): o handler de background aponta para esse mecanismo.
   - plano.md:311-313 (passo 29): T07 confere que o segundo argumento é o `'granted'` do mock, com o store em
     `'unsupported'`.
   - plano.md:438 (`## Contratos`): o comentário de `snoozeAlarm` foi atualizado e a assinatura ficou igual.
   - O guard `Platform.OS` de `getFullScreenPermission` (passo 16, plano.md:211) mantém o caminho seguro fora
     do Android.

Notas da rodada 2, conferidas:
- Nota 1 (passo 35 e `settings-row.tsx`) → **corrigida**. plano.md:344-348: a linha é escrita dentro de
  `reminders-settings-section.tsx` e nada importa de `src/prototipo/`. plano.md:353 (passo 37) cita os
  passos 30 e 35.
- Nota 2 (getter `actions`) → **corrigida**. plano.md:117: "sem getter".
- Nota 3 (ramo `status: 'active'` + `firedAt`) → **corrigida**. plano.md:139-140 traz o caso.

Coerência:
- `## Cobertura` (plano.md:520-555) continua 13/13 RT, 8/8 PR e 13/13 CB. RT-012 → T07 e RT-009 → T13/T14
  batem com os passos 4 e 29, e o conserto não removeu nada.
- `## Resumo do plano` acompanha a mudança. A plano.md:33-35 cobre a soneca da notificação que volta em tela
  cheia porque a permissão é consultada no sistema. A plano.md:58-59 lista as provas acrescentadas na volta 2.

## Novos nesta rodada
nenhum

## Spec em dúvida
nenhum

## Premissas
- `canUseFullScreenIntent` no headless task com o app morto: **não confirmável aqui**. O
  `react-native-notify-kit` ainda não está instalado: ele não existe em `node_modules/` da raiz nem em
  `packages/infra/mobile/ben/node_modules/`, porque o passo que adiciona a dependência ainda não rodou. Aceito
  como premissa com o fallback que o plano já descreve (plano.md:670-674): se falhar no aparelho, a soneca
  tocada na notificação volta como heads-up, não em tela cheia, e isso é conferido no APK.
  Para o usuário confirmar: "a soneca dada pelo botão da notificação, com o app fechado, pode voltar como
  heads-up em vez de tela cheia se a consulta de permissão não funcionar em segundo plano; aceita conferir isso
  só no APK?"
- Não revisei de novo os passos fora da Lista da volta 2, conforme a tarefa. As rodadas 1 e 2 já os
  conferiram.
