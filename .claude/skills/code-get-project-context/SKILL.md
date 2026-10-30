---
name: code-get-project-context
description: Gives the AI a quick, accurate picture of what the ben-prototype repository is, how its apps and packages are organized, and the design rules every Ben screen follows. Use at the start of any task so you never have to guess the project's purpose, structure, conventions, or design system.
---

# Ben Prototype: contexto do projeto

## Visão geral

**Ben** é um assistente pessoal por voz: "your busy-day brain: say it, Ben files it."

O `ben-prototype` é o **workspace de prototipação v1** desse app. Não é código de produção: serve para desenhar, iterar e validar as telas e interações do Ben antes do produto real.

O repositório é um monorepo pnpm no padrão do project-factory (`pnpm-workspace.yaml`, `nodeLinker: hoisted`). Os packages usam o escopo `@ben/<camada>-<nome>`:

```
packages/
  domain/{base,user,task,chat,topic,transcription,notification}   regras de negócio por módulo
  adapters/                                                        portas de serviços externos
  modules/{utils,env,tests}                                        código compartilhado
  infra/
    db/  adapters/  server-ben/                                    persistência, serviços externos, API HTTP
    mobile/{ben,design}                                            app Expo e sandbox de design
```

> **Onde o trabalho acontece:** features novas entram no app `packages/infra/mobile/ben` (e no backend quando a API muda). O `packages/infra/mobile/design` é o passo *anterior* à implementação: a mudança é desenhada lá primeiro, para ser vista sem pagar o custo de implementar.

## Índice de apps

| App | Tipo | Código | Responsabilidade | Contexto |
|---|---|---|---|---|
| Backend Ben | backend | `packages/domain/*`, `packages/adapters`, `packages/modules/*`, `packages/infra/{db,adapters,server-ben}` | API HTTP (Express 5) com domínio, ports, persistência e serviços externos (inclui registro de aparelhos para push) | [backend/description.md](./backend/description.md) |
| Ben (mobile) | mobile | `packages/infra/mobile/ben` | App React Native (Expo) que consome a API | [mobile/ben/description.md](./mobile/ben/description.md) |
| Design (sandbox) | mobile (design) | `packages/infra/mobile/design` | Galeria Vite + React onde cada estado de tela é uma rota | [mobile/design/description.md](./mobile/design/description.md) |

O design é um app Vite + React web que desenha telas de celular. Ele fica em `mobile/` porque segue os padrões do app mobile (decisão P1 da migração: "mobile" no lugar de "web" nos nomes).

## Como ler este contexto

1. Leia a visão geral e o índice acima para saber quais apps a tarefa toca.
2. Abra só os documentos do app envolvido.
   - Backend: [description.md](./backend/description.md) (propósito, regras de negócio, fluxos), [technology-stack.md](./backend/technology-stack.md), [architecture-overview.md](./backend/architecture-overview.md) (camadas e dependências), [project-structure.md](./backend/project-structure.md) (onde está cada coisa), [system-flows/README.md](./backend/system-flows/README.md) (endpoints e fluxos).
   - App Ben: [description.md](./mobile/ben/description.md), [technology-stack.md](./mobile/ben/technology-stack.md), [project-structure.md](./mobile/ben/project-structure.md).
   - Design: [description.md](./mobile/design/description.md), [project-structure.md](./mobile/design/project-structure.md), [design-rules.md](./mobile/design/design-rules.md) (regras visuais de toda tela Ben), [gallery-workflows.md](./mobile/design/gallery-workflows.md) (como adicionar estado de tela e componente).
3. Confira no código o que for relevante antes de confiar no texto. Este contexto descreve o estado implementado e pode estar atrás da working tree.

## Documentos fonte da verdade

Abra o relevante antes de qualquer decisão visual, de UX ou de copy. Não confie na memória do que é "a cara do Ben".

- [design.md](../../agents-docs/design-advisor/design.md): fonte da verdade do design system (paleta, tipografia, tokens de raio e espaçamento, voz da marca, layout, elevação, componentes).
- [ux-philosophy.md](../../agents-docs/project-context/ux-philosophy.md): a metáfora organizadora, "Chat with a Live Ledger". Decide *onde* uma feature fica na tela.
- [design-direction.md](../../agents-docs/project-context/design-direction.md): clima, tom e a trava de cor (vivid-but-adult, nunca monocromático).
- [Razão de negócio e casos de uso do v1](../../memory/business-rules/razao-de-negocio-e-casos-de-uso-v1.md): as regras de negócio registradas na memória.

## Limites do conteúdo

Este contexto registra o que existe e como se comporta hoje. Não guarda roadmap, plano, andamento de tarefa nem histórico de sessão. Para convenções estruturais reutilizáveis, consulte [code-get-coding-designs](../code-get-coding-designs/SKILL.md); para práticas de código, [code-write-code](../code-write-code/SKILL.md). Decisões e requisitos ficam na [memória](../../memory/README.md).
