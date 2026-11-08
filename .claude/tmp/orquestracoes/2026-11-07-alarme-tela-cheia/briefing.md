# Briefing — planejar (skill decidir-especificar-e-planejar) a tela de alarme em tela cheia com som para lembretes do Ben

## O pedido
"Use a skill decidir-especificar-e-planejar para planejar: Conhece o app alarmy [Image #1] o lembrete/alarme deverá ter uma tela de alarme que faça um barulho e consuma a tela toda do celular, pq se for só uma notificação qualquer ninguem se importa"

[Image #1] = print do Alarmy tocando (data, hora grande 15:48, balão "WAKE UP", botão "Snooze" com contador 3, botão "Iniciar missão", foto de gato de fundo, tela cheia). Cópia: referencia-alarmy.png nesta pasta.

## Perguntas e respostas
- Ideia principal (Problema: lembrete com horário vence e o aviso é notificação comum / painel pequeno com app aberto, a pessoa ocupada ignora; Não é: mudar a criação por voz, o resumo diário, nem gamificar o despertar; Exemplo: Ana, "me lembra às 15h de buscar o filho", celular bloqueado no silencioso, só vê às 15h40; Confirma: o aviso precisa ser impossível de ignorar, com celular bloqueado e app fechado, até a pessoa parar ou adiar): Sim, é isso (recomendada)
- Em quais aparelhos a tela cheia precisa funcionar nesta versão?: Só Android (recomendada)
- Quais lembretes viram alarme em tela cheia? (alarme, meta, condicional): Só os de horário (recomendada)
- Como deve ser o som?: Alarme em loop (recomendada) — toca como despertador, volume de alarme, mesmo no silencioso, até parar ou adiar
- Missão para desligar?: Não, botão Parar (recomendada) — Parar, Soneca e Concluir
- Distribuição: APK direto (recomendada) — o app pede para liberar a tela cheia nas configurações; se não liberar, notificação comum
- Protótipo: Sim, ver 3 variações (recomendada), rodando no app web
- Aprovações: Só spec e protótipo (recomendada) — roteiro e plano o orquestrador fecha (com a revisão automática do plano), o usuário lê no relatório final

## Definição de pronto
A pasta da run contém, no formato da skill decidir-especificar-e-planejar (.claude/skills/decidir-especificar-e-planejar/SKILL.md): decisao.md; spec.md com `## Gate` aprovado pelo usuário; prototipo.md com `## Escolha` do usuário e prints em prototipo/; projeto.md, reconhecimento.md, roteiro.md, plano.md e revisao-plano-{n}.md com veredito aprovado (ou bloqueios da 3ª rodada registrados como premissa); e o relatório final entrega a linha `/implementar-e-validar .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/`.

## Fora do escopo
- Implementar a feature (é da /implementar-e-validar). Só os arquivos de protótipo (rotas novas, sem commit) tocam o projeto.
- iOS (nem AlarmKit), Play Store/declarações de política, missão para dispensar.
- Lembretes do tipo meta e condicional (continuam com o painel atual).
- Criação de lembrete por voz e resumo diário.

## Autorizações
nenhuma (sem push, sem publicar). Protótipo: rotas novas no app sem commit, conforme a skill.

## Premissas
- Rodada 1 juntou Passo 0 (ideia principal) e a entrevista da Etapa 1 numa só ida ao usuário, para poupar rodadas.
- Gates do roteiro (4.2) e do plano (4.4) são fechados pelo orquestrador, por escolha do usuário; dúvidas técnicas do 4.2 viram premissa recomendada.
- O veredito da Etapa 1 e o gate da spec (Etapa 2) vão juntos na mesma rodada de perguntas.
- Protótipo roda no Expo web do app (:8081), regra da skill (componentes reais), e não no sandbox `packages/infra/mobile/design`; o plano decide se a tela também é registrada no sandbox.
- Com o app aberto (inclusive web), o lembrete de horário abre a mesma tela de alarme em tela cheia no lugar do painel atual.
- Soneca reaproveita as opções que já existem (GET /reminders/:id/snooze-options); o formato (lista ou toque único) fica para o protótipo.
- Sinal de sucesso: alarmes com ação (parar/soneca/concluir) em até 5 min do disparo, lidos pelo acknowledge do backend.
