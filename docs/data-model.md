# Data Model — Ben v1 (MongoDB)

Modelo de dados para o backend do Ben, derivado de `01-prd.md` e `02-features-and-states.md`.

A decisão de engine é **MongoDB** com **aggregates isolados**: cada aggregate root é uma collection própria, lida e escrita como uma unidade. Sub-documentos (todos, pending diff) ficam **embutidos** no aggregate ao qual pertencem; entidades compartilhadas (ex: usuário) são **referenciadas** por `_id`, nunca duplicadas.

Os tipos `note`, `reminder` e `task` do PRD (`captures` com `payload jsonb`) viram **collections separadas** aqui — payloads e lifecycles muito diferentes, e o encaixe é mais limpo com os aggregate roots já presentes em `project-backend/src/modules/domain/`.

---

## Collections (aggregate roots)

### User

Conta autenticada via Google OAuth. Único usuário no v1 (founder, N=1), mas modelado multi-tenant desde já.

```ts
{
  _id: ObjectId
  providerId: string   // identificador do provider OAuth — índice ÚNICO, usado no login
  email: string
  username: string
  name: string
  avatarUrl: string    // foto do perfil (Settings modal)
  createdAt: Date
}
```

### Message

Uma mensagem do stream de chat. Origem de toda captura.

```ts
{
  _id: ObjectId
  userId: ObjectId              // ref → User
  role: 'user' | 'ben'
  content: string               // texto final (transcrito, se veio de áudio)
  audioUrl?: string             // presente quando a mensagem foi voz
  transcriptionStatus?: 'pending' | 'done' | 'failed'   // só em mensagens de voz
  capture?: {                   // o que o Ben filou a partir desta mensagem (ausente se nada)
    kind: 'note' | 'reminder' | 'task'
    refId: ObjectId             // → _id do documento criado na collection correspondente
  }
  createdAt: Date               // janela das últimas 20 = sort por aqui, sem retrieval no v1
}
```

### Note

Algo para lembrar, sem ação agendada. Read-only no v1 (correções via conversa).

```ts
{
  _id: ObjectId
  userId: ObjectId     // ref → User
  messageId: ObjectId  // ref → Message de origem
  title: string        // vazio → UI mostra "untitled note" (não é problema do dado)
  body: string
  createdAt: Date
}
```

### Reminder

Lembrete one-off com horário. Alarme **mockado** no v1 (sem notificação de OS). Recurring fica para v2.

```ts
{
  _id: ObjectId
  userId: ObjectId               // ref → User
  messageId: ObjectId            // ref → Message de origem
  title: string
  firesAt: Date                  // quando "dispara" (visual no v1)
  status: 'upcoming' | 'fired'   // derivável de firesAt, mas persistido p/ indexar o scheduler
  createdAt: Date
}
```

### Task

Aggregate rico — a task workspace. Conteúdo colaborativo com loop de diff-approve. Auto-contido: lê e grava a workspace inteira numa operação atômica de documento único.

```ts
{
  _id: ObjectId
  userId: ObjectId                          // ref → User
  messageId: ObjectId                       // ref → Message de origem
  title: string
  contentType: 'text' | 'todo'              // fixo na criação no v1 (sem troca mid-task)
  textContent?: string                      // usado quando contentType = 'text'
  todoItems?: TodoItem[]                    // usado quando contentType = 'todo' (embutido)
  pendingDiff?: PendingDiff | null          // proposta do Ben aguardando approve/reject (embutido)
  status: 'created' | 'active' | 'finished'
  lastActivityAt: Date                      // ordena active-task picker e Tasks view
  finishedAt?: Date
  createdAt: Date
}
```

---

## Sub-documentos embutidos

### TodoItem

Item da lista, dentro de `Task.todoItems[]`.

```ts
{
  _id: ObjectId
  title: string
  done: boolean
  order: number   // ordenação manual (reorder na workspace)
}
```

### PendingDiff

Proposta de edição do Ben, dentro de `Task.pendingDiff`. Escopo de um turn (uma unidade approve/reject por turn do Ben).

```ts
{
  turnId: string
  proposedBy: 'ben'
  changes: unknown   // conteúdo proposto em forma aditiva/subtrativa (text ou todos)
  createdAt: Date
}
// null quando não há proposta pendente.
// PERSISTIDO — não pode sumir ao sair/reentrar na workspace (friction note crítica).
// Editar o conteúdo direto com diff pendente INVALIDA e descarta o diff no v1.
```

---

## Relacionamentos

- **User** `1 — N` **Message**, **Note**, **Reminder**, **Task** (sempre via `userId`).
- **Message** `1 — 0..1` **Note** | **Reminder** | **Task** — uma mensagem produz no máximo uma captura, referenciada por `Message.capture`.
- **Task** **embute** `TodoItem[]` e `PendingDiff` — não são collections; vivem dentro do aggregate Task.

---

## Índices recomendados

- **User**
  - `{ providerId: 1 }` único — lookup de login.

- **Message**
  - `{ userId: 1, createdAt: -1 }` — janela das últimas 20 mensagens e scroll do histórico.

- **Note**
  - `{ userId: 1, createdAt: -1 }` — Notes view (reverse-chronological).

- **Reminder**
  - `{ userId: 1, status: 1, firesAt: 1 }` — Reminders view (upcoming asc) e o scheduler global do v2. Sem este índice, a varredura de reminders vira collection scan e degrada com o crescimento.

- **Task**
  - `{ userId: 1, status: 1, lastActivityAt: -1 }` — active-task picker e Tasks view (active por atividade recente, finished por data).

---

## Estados transientes não persistidos (v1)

Dois estados de erro/carga descritos em `04-screen-prompts/02-chat-surface.md` vivem **só em memória** no v1. Decisão consciente: são edge cases curtos e o custo de modelá-los não se paga para o founder N=1. Documentados aqui para não virarem surpresa no dogfooding.

- **Save failed** (erro 4 da tela) — quando o Ben classifica a captura mas o save na collection (`Note`/`Reminder`/`Task`) falha. `Message.capture` só nasce **depois** do save bem-sucedido (com `refId`), então não há onde persistir uma tentativa que falhou. O retry inline no card é client-side: se o app fechar nesse estado, a falha some e o usuário precisa repetir a captura por conversa. **Quando doer:** adicionar `capture.status: 'saved' | 'failed'` + tornar `refId` opcional, gravando o intent **antes** de tentar persistir.

- **Offline queue** (modo "queueing supported") — mensagens capturadas offline ficam numa fila local (in-memory / localStorage), não na collection `Message`. Não há `sendStatus` no modelo. Se o app fechar com a fila cheia, as mensagens não-enviadas se perdem. **Quando doer:** adicionar `Message.sendStatus: 'queued' | 'sent' | 'failed'` (ausente = `sent`), processando a fila por `createdAt` no reconnect — distinto de `transcriptionStatus` (rede vs. transcrição são ciclos diferentes).

- **Ben reply failed** (erro 3 da tela) — **não é gap.** A bolha de erro do Ben nunca foi persistida porque a resposta não existiu; perdê-la no reload é o comportamento correto.

---

## Notas de evolução (v1.5 / v2)

- **Vector retrieval de memória** (v2): usar **Atlas Vector Search** sobre `Message`/`Note` — mantém o mesmo banco, sem migração de engine.
- **Recurring reminders** (v2): nova collection `RecurringReminder` ou campo `recurrence` no `Reminder` — decidir só quando os alarmes realmente dispararem.
- **Notion sync** (v1.5): campo opcional `notionRef` nos aggregates sincronizados — referência, não duplicação de dado.
- **Alternativa de modelagem**: `Note` + `Reminder` poderiam colapsar numa única collection `Capture` com `type` + payload, caso o overhead de duas collections simples incomode. `Task` permanece separada de qualquer forma (aggregate rico).
