import { ActiveConversation, TopicKey, UserMemory } from '@ben/adapters'
import { BEN_SYSTEM_PROMPT } from '@ben/infra-adapters/services/ben-agent-provider/ben-system-prompt'

type SystemPromptInput = {
  topicIndex: TopicKey[]
  activeConversation: ActiveConversation | null
  memories: UserMemory[]
}

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

  const topicSection = [
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
    '- `newReminders`: lembretes, cada um com `title` e, opcionalmente, `remindAt` e `notes`.',
    '- `newNotes`: notas, cada uma com `title` e `body`.',
    '- `newTasks`: tarefas, cada uma com `title` e `contentType` — use `todo` quando a intenção for uma lista de itens (liste os itens) e `text` quando for um rascunho/texto corrido (inclua o texto, pode ser vazio).',
    '- `conversation`: `slug` (reutilize o slug existente da conversa atual) e `summary`, um resumo cumulativo da conversa inteira, incluindo este turno.',
    '- `memories`: somente fatos duradouros novos ou alterados, cada um com `key` no formato `categoria:subcategoria` em kebab-case (ex.: `familia:nome-familiares` com valor "Mãe: Maria; Pai: João") e `value`; lista vazia quando não houver.',
    'Proponha lembretes, notas e tarefas somente quando a mensagem do usuário pedir ou implicar claramente esses itens; caso contrário, indique explicitamente que não há itens desse tipo.',
    'Estruture o seu texto deixando claro qual parte é a `message` para o usuário e quais são os lembretes, notas, tarefas e tópicos identificados.',
  ].join('\n')

  return `${BEN_SYSTEM_PROMPT}${topicSection}`
}
