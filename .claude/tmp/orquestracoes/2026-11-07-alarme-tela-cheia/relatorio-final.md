# Relatório final — alarme em tela cheia para lembretes de horário (Android)

**Veredito:** plano aprovado (revisão automática aprovou na rodada 3; roteiro e plano fechados pelo
orquestrador, como o usuário escolheu). O plano faz o lembrete de horário virar um alarme em tela cheia
no Android, com som de alarme em loop mesmo no silencioso, e Parar, Soneca (slider de 5 min a 2 h) e
Concluir; com o app aberto (inclusive web), a mesma tela substitui o painel atual.

## Cobertura
13/13 RT · 8/8 PR · 13/13 CB. Lanes: browser, teste, codigo. 5 checkpoints, 37 passos. Marco 1 no
checkpoint 2 (base nativa, com APK de debug gerado), marco 2 no checkpoint 3 (agendamento e fila).
Onda única. Não cruza só o mobile: o domínio `chat` e o servidor passam a registrar disparo e instante
de cada ação (sem migração).

## Comprovação
37 provas: 18 screenshots (S01–S18, Expo web 390x844) e 19 casos de suíte (T01–T19), mais seções de
lane codigo para RT-001, RT-004, RT-011 e RT-013. Ambiente: `pnpm dev` na raiz (API :3333 + Expo web
:8081). Nenhuma prova era vídeo. S18 tem espera real de 10 min. Provas acrescentadas pelo planejador:
ids RT-003→T16, RT-004→T17, RT-008→T06/T08, e casos novos em T06, T07 e T14. Nenhuma dispensada.
Fixtures: sem mecanismo; estado: nenhum (cada prova monta o seu pelo chat; S10, S12 e S13 usam
`?simular=` só em desenvolvimento).

## Arquivos
- [spec.md](spec.md), [decisao.md](decisao.md), [prototipo.md](prototipo.md) (V4 aprovada,
  [print](prototipo/v4.png); base em `packages/infra/mobile/ben/app/prototipo/alarme-tela-cheia/` e
  `src/prototipo/alarme-tela-cheia/`, removida no último passo do plano)
- [projeto.md](projeto.md), [reconhecimento.md](reconhecimento.md), [roteiro.md](roteiro.md)
- [plano.md](plano.md) — `## Resumo do plano` e lista dos arquivos que a implementação toca
- [revisao-plano-1.md](revisao-plano-1.md), [revisao-plano-2.md](revisao-plano-2.md),
  [revisao-plano-3.md](revisao-plano-3.md) (aprovado)
- [log-planejamento.md](log-planejamento.md)

## Premissas (decididas sem o usuário; ele confirma ou corrige)
- **Som por módulo nativo próprio.** O `react-native-notify-kit` não aceita som com uso de alarme no
  canal, então ele agenda, abre a tela cheia e trata o reinício e as ações. Um módulo Expo pequeno,
  versionado no repo, toca o som em loop no volume de alarme e se cala sozinho em 10 min.
- **Só o aviso da hora marcada vira alarme.** Segue a AC-004 contra o trecho da PR-001 que dizia
  "cada aviso".
- **Soneca dada pela notificação, sem abrir a tela, é de 10 min.** Não confirmado: a soneca com o app
  fechado depende de `canUseFullScreenIntent` funcionar em segundo plano. Se falhar, ela volta como
  aviso no topo da tela, não em tela cheia. Só se confere no APK.
- **O app abre por cima da tela de bloqueio sempre que está na frente**, não só durante o alarme.
  Risco: quem travar o celular com o app aberto vê o app por cima do bloqueio.
- **Fica sem captura**, para conferir no aparelho: o som no silencioso e a tela por cima do bloqueio.
- **Desvios da spec declarados no plano (6):**
  - PR-001 contra AC-004;
  - o uso de alarme da RT-004 vem do módulo, não do canal;
  - a PR-005 não tem vídeo;
  - a PR-008 roda à mão;
  - as provas no aparelho ficam sem captura;
  - a RT-010 mostra só o título.
- **Desvios de padrão aceitos pela revisão (5):**
  - o teste do plugin fica em `src/services/__tests__`;
  - a pasta `modules/` é nova;
  - `main` passa a ser `index.ts`;
  - `alarm-actions.ts` fica sem o sufixo `-service`;
  - a simulação de permissão fica nos `.web.ts`, só em dev.
- A memória `business-rules/razao-de-negocio-e-casos-de-uso-v1.md` ("sem OS notification / alarmes
  mockados") está desatualizada frente ao código.

## Próximo passo
Daqui em diante, a implementação roda sozinha até o fim, sem perguntas:

```text
/implementar-e-validar .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/
```
