# Gate r0 — rodada 1 de perguntas (O1)

Base: r0-mapa-logo.md.

## Ideia principal (Passo 0 da skill, enviada para confirmação)
Problema: fora das telas do app (ícone na tela inicial, splash, aba do navegador, ícone de notificação) o Ben ainda aparece com a marca antiga de três círculos pretos; dentro do app (header, login, avatar) a marca já é o balão âmbar com ondas de voz. Quem usa vê duas identidades.
Não é: redesenhar a logo nem mudar tema/cores das telas.
Exemplo: abrir o web em :8081 — header com balão âmbar, aba com três círculos pretos; instalar o APK — ícone e splash com círculos.
Confirma?: a logo certa é o balão âmbar do header (sem o texto "Ben"), aplicada a ícone, adaptive, splash, favicon e notificação gerados por scripts/generate-icons.mjs.

## Perguntas enviadas
1. Confirma a ideia principal?
2. Escopo: só app Ben (recomendada) | app Ben + sandbox de design.
3. Fundo do ícone/splash: fundo claro com balão âmbar (recomendada) | fundo âmbar com balão claro.
4. Geração: dependência de dev de rasterização SVG (recomendada) | rasterizador próprio sem dependência | PNGs fixos e tirar `pnpm icons` dos hooks.

## Premissas já assumidas
- Ícone de notificação: silhueta monocromática branca do balão com barras recortadas (padrão Android).
- Ícone leva só o símbolo, sem o wordmark "Ben".
- Pasta `android/` é gerada e gitignorada; não se edita.
