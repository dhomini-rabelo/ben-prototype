# Decisão — Trocar a logo antiga (3 círculos) pela logo atual (balão âmbar do header) nos ícones do app Ben

Tipo: **issue** (a marca fora das telas ficou para trás do redesign de 2026-10-26).

## Pedido
"A logo do projeto ainda esá a antiga, não está a logo atual que é a que está no header"

## Ideia principal
Problema: fora das telas (ícone do app, ícone adaptativo do Android, splash, aba do navegador, notificação) o Ben ainda mostra os 3 círculos pretos antigos, enquanto dentro do app já é o balão âmbar do header; quem instala ou abre o app vê duas marcas diferentes.
Não é: redesenhar a logo, mudar o tema ou as cores das telas, nem mexer no sandbox de design.
Exemplo: a pessoa instala o APK do Ben, vê os 3 círculos pretos no launcher e na tela de splash, abre o app e encontra o balão âmbar no header; ao receber um lembrete, a barra de status mostra os círculos de novo.
Confirma? Sim, a logo certa é o balão âmbar do header, sem o texto "Ben", aplicada a todos esses ícones (confirmado pelo usuário no briefing).

## Brief
problema:        Os 6 PNGs de `assets/` do app Ben (ícone, adaptive foreground, monochrome, splash, notificação, favicon) ainda desenham os 3 círculos pretos de antes de 2026-10-26; o `generate-icons.mjs` só sabe desenhar círculos e roda antes de `dev`, `start`, `android` e `apk`, então trocar os PNGs à mão seria desfeito no próximo `pnpm dev`. Reprodução: abrir a aba do app no web (:8081), instalar o APK, ver o splash ou receber um lembrete (evidência: r0-mapa-logo.md, leitura do script e dos PNGs).
para quem:       P1 pessoa que usa o Ben no celular e na web (vê launcher, splash, aba, notificação) — gravidade baixa a média, é identidade de marca, não bloqueia uso, mas aparece em toda abertura do app; P2 quem desenvolve e gera o app (roda o script de ícones; o README manda mantê-lo em lockstep com o SVG).
por que agora:   O redesign do tema (balão âmbar) já está no app; deixar os ícones antigos faz o lançamento do APK sair com marca inconsistente. Se não for agora, cada novo APK reforça a marca antiga (agente).
sinal de sucesso: Os 6 PNGs gerados mostram o balão âmbar (conferido por foto e por teste de pixels), `pnpm dev` não os sobrescreve de volta com círculos, e `grep` por "círculos" no README do app não encontra a descrição antiga. Lido nos arquivos gerados e na aba do navegador (:8081).
menor versão:    A própria versão completa: é uma troca de arte e de script, sem parte separável que já meça o sinal (trocar só o PNG não passa, o script desfaz).
versão completa: Mesma coisa, mais os complementos propostos abaixo, se aceitos.

Premissas (agente), todas já cobertas pelas respostas do briefing ou sem risco para o veredito:
- Ícones levam só o símbolo, sem o wordmark "Ben" (briefing).
- Ícone de notificação: silhueta branca do balão com as barras vazadas, padrão Android (briefing).
- Fundo claro = cor de fundo do tema atual do app (`#f6f4f2`), não o `#f9f9f9` antigo (ver spec, RT-003).
- README do app atualizado junto (briefing).
- Sem entrevista: lacunas = 0, premissas arriscadas = 0 (as 4 respostas do briefing fecharam escopo, fundo, método e ideia principal).

## Pesquisa
Projeto, sem pesquisa externa (troca de arte interna, sem equivalente de mercado a comparar):
- `r0-mapa-logo.md` nesta pasta (mapa de onde a logo aparece, histórico e ferramentas).
- `packages/infra/mobile/ben/app.config.ts` (ícone, adaptive `#f9f9f9`, splash `#f9f9f9`, notificação `#121213`, favicon).
- `packages/infra/mobile/ben/src/layout/components/icons/ben-logo.tsx` (geometria: `BALLOON_PATH`, `FOLD_PATH`, 3 barras; variante `brand`: corpo `#f9a12f`, dobra `#f3dcbb`, barras `#1d1814`).
- `packages/infra/mobile/ben/tailwind.config.js` (`background`/`surface` = `#f6f4f2`; `colors.ts` manda manter em lockstep com ele).
- `packages/infra/mobile/ben/package.json` (`icons` roda antes de `dev`/`start`/`android`/`apk`; já existe Vitest em `test:unit`).
- `packages/infra/mobile/ben/README.md` (descreve a marca como círculos e manda manter o script em lockstep com `ben-logo.tsx`).
- Memória do projeto: sem registro sobre logo/marca.

## Lentes
- PM: O problema é real e observável (qualquer instalação mostra a marca antiga no launcher, splash e notificação); o sinal de sucesso é verificável por foto dos assets e por teste de pixels, só o launcher/splash nativo não se captura no web.
- Fundador: Vale agora porque o redesign já saiu e o próximo APK sairia com marca inconsistente; custo baixo, não ocupa o produto; deixa de fazer só o sandbox de design, que o usuário excluiu.
- Tech lead: Custo baixo a médio, concentrado em `generate-icons.mjs` + uma dependência de dev de rasterização SVG (escolha do usuário); o risco é a dependência com binário nativo e a perda do "gera offline sem dependência"; mais simples que reescrever um rasterizador próprio de Path com arcos. Sem divergência entre as lentes.

## Veredito
vai — é um defeito real de marca (ícones desatualizados em relação ao redesign), resolve um problema visível para toda pessoa que instala o app, e o custo é baixo e já tem caminho escolhido pelo usuário.

## Decisão do usuário
vai — "Aprovo (recomendada)" (gate de 2026-11-07, junto da spec)

## Complementos
Propostos pelo agente; o usuário aceita ou recusa um a um no gate. Ordem do que mais serve à persona ao que menos.
- Cor de destaque da notificação (o tom que o Android aplica ao ícone pequeno) passa de preto `#121213` para o âmbar da marca — para P1, atende "a notificação ainda parece a marca antiga" — aceito
- Teste automatizado sobre os PNGs gerados (dimensões, fundo opaco no ícone, transparência na silhueta, cor do balão no centro) — para P2, atende "o script desfazer a troca ou a geometria divergir sem ninguém ver" — recusado: usuário não achou necessário; com a fonte única e as fotos de antes/depois o ganho é pequeno (recomendação do agente, aceita)
- Geometria e cores da logo numa fonte única que o `ben-logo.tsx` e o script leem — para P2, atende "o README manda manter dois desenhos em lockstep à mão" — aceito
- Pasta de assets sem nenhum círculo antigo sobrando (remover constantes e texto do README ligados aos círculos) — para P2, atende "doc e script contando a marca antiga" — recusado: já coberto pela reescrita do gerador e pela AC-008 (README)

## Menor versão
Os 6 PNGs gerados com o balão âmbar do header (símbolo sem texto, fundo claro no ícone, adaptive e splash; silhueta branca na notificação), o `generate-icons.mjs` rasterizando o SVG do header por uma dependência de dev e continuando a rodar antes de `dev`/`start`/`android`/`apk`, e o README do app atualizado. É a versão completa também.

## Como medir
- Foto dos 6 PNGs gerados (antes: círculos; depois: balão) e da aba do navegador no web (:8081).
- Teste de pixels nos PNGs, lido na saída do `pnpm --filter @ben/mobile-ben test:unit`.
- `pnpm dev` (que roda `pnpm icons`) seguido de conferência de que os PNGs continuam com o balão.
- Ícone do launcher, adaptive, splash nativo e notificação não são observáveis no web: vão por teste e leitura do PNG, marcados `(sem captura)` na spec.
