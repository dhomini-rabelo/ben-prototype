# Briefing — planejar a troca da logo antiga (3 círculos) pela logo atual (balão âmbar do header) nos ícones do app Ben

## O pedido
Use a skill decidir-especificar-e-planejar para planejar: A logo do projeto ainda esá a antiga, não está a logo atual que é a que está no header

## Perguntas e respostas
- Ideia principal: fora das telas (ícone do app, splash, aba do navegador, notificação) o Ben ainda mostra os 3 círculos pretos antigos; dentro do app já é o balão âmbar do header. Não é redesenhar a logo nem mudar o tema. A logo certa é o balão âmbar do header, sem o texto 'Ben', aplicada a todos esses ícones. Confirma?: Sim, é isso (recomendada)
- O sandbox de design (:3002) também está com a logo antiga (círculos pretos) e usa o favicon roxo padrão do Vite. Ele entra no escopo?: Só o app Ben (recomendada)
- Como fica o fundo do ícone do app, do ícone adaptativo do Android e do splash?: Claro + balão âmbar (recomendada)
- O script que gera os PNGs só sabe desenhar círculos. Como passar a gerar a logo nova?: Dependência de dev (recomendada) — rasterizador de SVG (ex.: @resvg/resvg-js), o script desenha exatamente o SVG do header.

## Definição de pronto
A task é SÓ planejar (skill decidir-especificar-e-planejar, Etapas 1 a 4). Pronto = a pasta da run tem `decisao.md`, `spec.md` com `## Gate`, `projeto.md`, `reconhecimento.md`, `roteiro.md`, `plano.md` e `revisao-plano-{n}.md` aprovada, o usuário aprovou o plano no gate 4.4, e o retorno final traz a linha `/implementar-e-validar .claude/tmp/orquestracoes/2026-11-07-logo-antiga/`.

## Fora do escopo
- Implementar (é da /implementar-e-validar).
- Sandbox de design `packages/infra/mobile/design` (logo e favicon de lá ficam como estão).
- Redesenhar a logo ou mudar tema/cores das telas.
- Editar `packages/infra/mobile/ben/android/` (gerado e gitignorado).

## Autorizações
nenhuma (adicionar dependência de dev de rasterização SVG ao pacote @ben/mobile-ben foi escolhido pelo usuário como abordagem do plano).

## Premissas
- Logo atual = `BenLogo` variante `brand` em `packages/infra/mobile/ben/src/layout/components/icons/ben-logo.tsx`; antiga = 3 círculos de `scripts/generate-icons.mjs`.
- Ícones levam só o símbolo, sem o wordmark "Ben".
- Ícone de notificação: silhueta monocromática branca do balão com as barras recortadas (padrão Android).
- `README.md` do app Ben, que descreve a marca como círculos, é atualizado junto.
- Veredito da Etapa 1 e spec da Etapa 2 vão ao usuário no mesmo gate (issue sem lacunas no brief; a ideia principal já foi confirmada), para poupar uma rodada.
- Mapa de partida: r0-mapa-logo.md nesta pasta.
