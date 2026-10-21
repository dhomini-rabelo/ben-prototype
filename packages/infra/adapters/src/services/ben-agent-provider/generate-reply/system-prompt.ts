import {
  ActiveConversation,
  ActiveGoal,
  TopicKey,
  UserMemory,
} from '@ben/adapters'
import { BEN_SYSTEM_PROMPT } from '@ben/infra-adapters/services/ben-agent-provider/ben-system-prompt'

type SystemPromptInput = {
  topicIndex: TopicKey[]
  activeConversation: ActiveConversation | null
  memories: UserMemory[]
  now: string
  timeZone: string
  activeGoals: ActiveGoal[]
}

const formatNow = (now: string, timeZone: string): string =>
  new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(now))

export const buildSystemPrompt = (input: SystemPromptInput): string => {
  const renderedIndex =
    input.topicIndex.length > 0
      ? input.topicIndex.map((topic) => `- ${topic}`).join('\n')
      : '(nenhum tópico conhecido ainda)'

  const conversationLines = input.activeConversation
    ? [
        `Chave: ${input.activeConversation.key}`,
        `Resumo: ${input.activeConversation.summary}`,
      ]
    : [
        'Não há conversa ativa: crie um slug kebab-case curto do assunto desta conversa.',
      ]

  const renderedMemories =
    input.memories.length > 0
      ? input.memories
          .map((memory) => `- ${memory.key}: ${memory.value}`)
          .join('\n')
      : '(nenhuma memória ainda)'

  const renderedGoals =
    input.activeGoals.length > 0
      ? input.activeGoals
          .map((goal) =>
            [
              `- id: ${goal.id} | título: ${goal.title}`,
              ...goal.messages.map((message) => `  - mensagem: ${message}`),
            ].join('\n'),
          )
          .join('\n')
      : '(nenhum goal ativo)'

  const topicSection = [
    '',
    '',
    '# Agora',
    `Agora é ${formatNow(input.now, input.timeZone)} (${input.now}), no fuso ${input.timeZone}.`,
    'Resolva "hoje", "amanhã", "sexta" etc. a partir deste instante. Datas SEMPRE em ISO 8601 com o offset do fuso do usuário (ex.: 2026-10-22T17:00:00-03:00).',
    '',
    '',
    '# Goals ativos',
    renderedGoals,
    '',
    '',
    '# Memória de tópicos',
    'Estes são os tópicos recorrentes já conhecidos deste usuário (sugestões):',
    renderedIndex,
    'Cada tópico segue o formato `kind:category:slug` (ex.: `reminder:work:meeting`).',
    'Quando a mensagem do usuário combinar com um tópico existente, reutilize exatamente aquela chave.',
    'Quando nenhum tópico existente combinar, crie uma nova chave no formato `kind:category:slug`.',
    'Você PODE chamar a ferramenta `get-history-context` UMA ÚNICA VEZ antes de responder, passando os tópicos sobre os quais você precisa de mais contexto. Analise a mensagem do usuário para decidir quais tópicos buscar.',
    '',
    '',
    '# Histórico da conversa',
    'As mensagens anteriores da conversa (do usuário e suas) vêm antes da mensagem atual.',
    'Chame a ferramenta `get-older-messages` somente quando a resposta depender de algo que não está nessas mensagens: cada chamada traz a próxima página de mensagens mais antigas, no máximo 3 chamadas.',
    '',
    '',
    '# Conversa atual',
    ...conversationLines,
    'A ferramenta `get-history-context` sempre traz a conversa atual (chave `conversa:…`) junto com os tópicos pedidos.',
    '',
    '',
    '# Memórias do usuário',
    renderedMemories,
    '',
    '',
    '# Formato de saída esperado',
    'A sua resposta será convertida posteriormente em um objeto com os campos abaixo, então deixe TODAS essas informações explícitas no seu texto:',
    '- `message`: a resposta em linguagem natural para o usuário, seguindo a sua persona.',
    '- `historyTopics`: os tópicos relacionados a este turno, cada um com um resumo curto.',
    '- `newReminders`: lembretes, cada um com `title`, `kind` (`alarm` ou `conditional`) e, opcionalmente, `remindAt`, `notes`, `alerts` e `checkFrequency`.',
    '  - `alerts` (só alarme): "um dia antes" → `day-before`; "pela manhã" → `morning-of`; "N minutos/horas antes" → `minutes-before` com `minutes`; sem frase de aviso → um único `at-event`.',
    '  - Algo "quando X acontecer" sem data → `kind` `conditional`, sem `remindAt`, com `checkFrequency` (`daily` por padrão, `every-n-days` com `days` ou `weekly` se o usuário disser outra).',
    '- `newNotes`: notas, cada uma com `title` e `body`.',
    '- `newTasks`: tarefas, cada uma com `title` e `contentType` — use `todo` quando a intenção for uma lista de itens (liste os itens) e `text` quando for um rascunho/texto corrido (inclua o texto, pode ser vazio).',
    '- `newGoals`: goals (hábito/objetivo com horário, ex.: academia às 11h), cada um com `title`, `startsAt` (ISO 8601 com offset), `recurrence` (`none`, `daily` ou `weekdays` com `weekdays`, 0 = domingo) e `messages` (frases motivacionais ou problemas que o usuário disse, curtas e literais).',
    'Goals: quando o usuário falar de um hábito/objetivo com horário, PERGUNTE se quer salvar como goal e NÃO registre nada nesse turno. Só preencha `newGoals` no turno seguinte, se o usuário confirmar.',
    '- `goalUpdates`: para acrescentar mensagens a um goal existente, `goalId` (id da lista "Goals ativos") e `messages` novas.',
    '- `conversation`: `slug` (reutilize o slug existente da conversa atual) e `summary`, um resumo cumulativo da conversa inteira, incluindo este turno.',
    '- `memories`: somente fatos duradouros novos ou alterados, cada um com `key` no formato `categoria:subcategoria` em kebab-case (ex.: `familia:nome-familiares` com valor "Mãe: Maria; Pai: João") e `value`; lista vazia quando não houver.',
    'Proponha lembretes, notas e tarefas somente quando a mensagem do usuário pedir ou implicar claramente esses itens; caso contrário, indique explicitamente que não há itens desse tipo.',
    'Estruture o seu texto deixando claro qual parte é a `message` para o usuário e quais são os lembretes, notas, tarefas e tópicos identificados.',
  ].join('\n')

  return `${BEN_SYSTEM_PROMPT}${topicSection}`
}
