import { TopicKey } from '@/adapters/agent-provider'
import { BEN_SYSTEM_PROMPT } from '../ben-system-prompt'

export const buildSystemPrompt = (topicIndex: TopicKey[]): string => {
  const renderedIndex =
    topicIndex.length > 0
      ? topicIndex.map((topic) => `- ${topic}`).join('\n')
      : '(nenhum tópico conhecido ainda)'

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
    '# Formato de saída esperado',
    'A sua resposta será convertida posteriormente em um objeto com os campos abaixo, então deixe TODAS essas informações explícitas no seu texto:',
    '- `message`: a resposta em linguagem natural para o usuário, seguindo a sua persona.',
    '- `historyTopics`: os tópicos relacionados a este turno, cada um com um resumo curto.',
    '- `newReminders`: lembretes, cada um com `title` e, opcionalmente, `remindAt` e `notes`.',
    '- `newNotes`: notas, cada uma com `title` e `body`.',
    '- `newTasks`: tarefas, cada uma com `title` e `contentType` — use `todo` quando a intenção for uma lista de itens (liste os itens) e `text` quando for um rascunho/texto corrido (inclua o texto, pode ser vazio).',
    'Proponha lembretes, notas e tarefas somente quando a mensagem do usuário pedir ou implicar claramente esses itens; caso contrário, indique explicitamente que não há itens desse tipo.',
    'Estruture o seu texto deixando claro qual parte é a `message` para o usuário e quais são os lembretes, notas, tarefas e tópicos identificados.',
  ].join('\n')

  return `${BEN_SYSTEM_PROMPT}${topicSection}`
}
