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
    'Preencha `historyTopics` com os tópicos relacionados a este turno, cada um com um resumo curto.',
    'Proponha `newReminders`, `newNotes` e `newTasks` somente quando a mensagem do usuário pedir ou implicar claramente esses itens; caso contrário, deixe-os como listas vazias.',
    'Para cada item em `newTasks` defina `contentType`: use `todo` quando a intenção for uma lista de itens (preencha `todoItems` com os títulos) e `text` quando for um rascunho/texto corrido (preencha `textContent`, pode ser vazio).',
    'O campo `message` é a resposta em linguagem natural para o usuário, seguindo a sua persona.',
  ].join('\n')

  return `${BEN_SYSTEM_PROMPT}${topicSection}`
}
