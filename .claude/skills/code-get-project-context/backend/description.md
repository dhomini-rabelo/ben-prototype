# Backend Ben: descrição

## Propósito

API Node.js do Ben. Atende o app `packages/infra/mobile/ben` e cobre: login com Google (Firebase), chat com o agente Ben, transcrição de áudio, captura de notas, lembretes e tarefas a partir das mensagens, o workspace de tarefas (diff, todos, conclusão) e as preferências do agente.

O backend é um conjunto de packages pnpm, não uma pasta única. O processo que sobe é o `@ben/server-ben`; os outros packages são dependências dele.

## Módulos de domínio

Cada módulo é um package `@ben/domain-<nome>` com `src/enterprise/entities/`, `src/application/{use-cases,repositories}/` e testes ao lado.

| Módulo | Entidades | Use cases (`application/use-cases/`) |
|---|---|---|
| `user` | `user` | `auth/`, `agent-preferences/` |
| `task` | `task` | `tasks/` |
| `chat` | `message`, `note`, `reminder` | `messages/`, `captures/` |
| `topic` | `topic`, `topic-summary` | `topics/` |
| `transcription` | (nenhuma) | `transcription/` |

Quem é dono de quê entre módulos está em [`packages/domain/ownerships.md`](../../../../packages/domain/ownerships.md): `task` é dono de `TaskRepository` (usado por `persist-captures` do `chat`) e `user` é dono de `resolveAgentSelection` (usado por `task`).

## Regras de negócio

As regras de negócio e os casos de uso do v1 estão em [razao-de-negocio-e-casos-de-uso-v1.md](../../../memory/business-rules/razao-de-negocio-e-casos-de-uso-v1.md). Este contexto não as repete.

## Fluxos do sistema

Endpoints e fluxos em [system-flows/README.md](./system-flows/README.md).

## Mais contexto

- [technology-stack.md](./technology-stack.md)
- [architecture-overview.md](./architecture-overview.md)
- [project-structure.md](./project-structure.md)
