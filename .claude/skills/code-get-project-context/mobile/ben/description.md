# App Ben (mobile): descrição

> **Status: foco do desenvolvimento ativo.** É aqui que entram as features e mudanças.

**Pacote:** `@ben/mobile-ben`, em `packages/infra/mobile/ben`.

## Propósito

A implementação mobile do Ben, em React Native (Expo). Combina peças agnósticas de plataforma (cliente de API e contratos, estado com Zustand/Jotai, hooks do React Query, máquina de estados de voz, tokens de design) com apresentação e peças específicas de plataforma (primitivas de UI, navegação, áudio, auth, storage). Consome a API do [backend](../../backend/description.md).

Cobre: login com Google, chat com o agente Ben, o workspace de tarefas e o menu de navegação (tarefas, notas, lembretes, com detalhe e configurações), mais notificações locais para lembretes.

## Regras visuais

Toda tela do Ben segue as [regras de design](../design/design-rules.md) e o design system em [design.md](../../../../agents-docs/design-advisor/design.md). Telas novas são desenhadas primeiro no [sandbox de design](../design/description.md).

## Mais contexto

- [technology-stack.md](./technology-stack.md)
- [project-structure.md](./project-structure.md)
- Padrões de código: [code-get-coding-designs](../../../code-get-coding-designs/SKILL.md) (API client, page stores, feature state components, services layer, token persistence) e [code-write-code](../../../code-write-code/SKILL.md).
