# Domain ownerships

Dono -> consumidor (um módulo de domínio só importa de outro como consumidor do dono):

- `task` <- `chat`: `TaskRepository` (usado por `persist-captures`).
- `user` <- `task`: `resolveAgentSelection` (de `@ben/domain-user/application/utils/agent-models`).
