import {
  AgentReply,
  AgentService,
  GenerateReplyPayload,
  GenerateTaskTurnPayload,
  ResolveHistoryContext,
  TaskTurnReply,
  TopicKey,
} from '@/adapters/agent-provider'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText, Output, stepCountIs, tool } from 'ai'
import { z } from 'zod'
import { env } from './env'

const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const model = google('gemini-2.5-flash-lite')

const BEN_SYSTEM_PROMPT = [
  'Current year: 2026.',
  'You are Ben, a very concise, friendly personal assistant.',
  'Reply to the latest user message only, in one or two short sentences.',
  'However you can go on for a feel more humanized and friendly sentences if a small answer feels too empty or robotic.',
  'Reply using Brazilian Portuguese.',
  'Behave like a human, like you very close to the user, but do not say you are an AI.',
  'Always call the user "mano", avoid using the user name, "você"',
  'Do not be indecisive for very open questions that could be answered in many ways, like "qual o melhor time do Brasil?" or "qual a melhor série da Netflix?" faça uma escolha e justifica sua resposta brevemente de forma humanizada, como: Flamengo, meu jogador favorito é o Bruno Henrique, aquele time do Jorge Jesus foi o melhor futebol que já vimos nesse país',
  'Examples: ',
  'User: Oi / Ben: Fala mano, o que manda?',
  '',
  '',
  '# Rules',
  '- You can not lie, but you can be creative for answering open question without lying about facts - you should say "eu não sei" when you don not know the answer, but you can be creative for answering open question without lying about facts - you should say "eu não sei" when you don not know the answer, but you can be creative for answering open question without lying about facts',
  'Say that you do not know when you do not know the answer, say that you do not have the information, or you are not updated',
].join(' ')

const reminderDraftSchema = z.object({
  title: z.string(),
  remindAt: z.string().optional(),
  notes: z.string().optional(),
})

const noteDraftSchema = z.object({
  title: z.string(),
  body: z.string(),
})

const taskDraftSchema = z.object({
  title: z.string(),
  contentType: z.enum(['text', 'todo']),
  textContent: z.string().optional(),
  todoItems: z.array(z.string()).optional(),
})

const historyTopicSchema = z.object({
  topic: z.string(),
  summary: z.string(),
})

const agentReplySchema = z.object({
  message: z.string(),
  newReminders: z.array(reminderDraftSchema),
  newNotes: z.array(noteDraftSchema),
  newTasks: z.array(taskDraftSchema),
  historyTopics: z.array(historyTopicSchema),
})

const buildSystemPrompt = (topicIndex: TopicKey[]): string => {
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

const buildHistoryContextTool = (
  resolveHistoryContext: ResolveHistoryContext,
) =>
  tool({
    description:
      'Busque o histórico relacionado a um conjunto de tópicos antes de responder. Use no máximo uma vez por mensagem.',
    inputSchema: z.object({
      topics: z.array(z.string()),
    }),
    execute: ({ topics }) => resolveHistoryContext({ topics }),
  })

const proposedTodoItemSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  done: z.boolean(),
  order: z.number(),
  diff: z.enum(['added', 'removed', 'unchanged']),
})

const proposedTaskChangesSchema = z.union([
  z.object({
    contentType: z.literal('text'),
    after: z.string(),
  }),
  z.object({
    contentType: z.literal('todo'),
    items: z.array(proposedTodoItemSchema),
  }),
])

const taskTurnReplySchema = z.object({
  message: z.string(),
  proposedChanges: proposedTaskChangesSchema.nullable(),
  updatedSummary: z.string(),
})

const buildTaskTurnSystemPrompt = (
  payload: GenerateTaskTurnPayload,
): string => {
  const renderedContent =
    payload.contentType === 'todo'
      ? (payload.todoItems ?? [])
          .map(
            (item) => `- [${item.done ? 'x' : ' '}] (${item.id}) ${item.title}`,
          )
          .join('\n') || '(lista vazia)'
      : payload.textContent || '(sem conteúdo ainda)'

  const taskSection = [
    '',
    '',
    '# Workspace de task',
    'Você está colaborando com o usuário dentro de uma task focada.',
    `Título da task: ${payload.title}`,
    `Tipo de conteúdo: ${payload.contentType}`,
    'Conteúdo atual:',
    renderedContent,
    '',
    '# Resumo da conversa desta task',
    payload.summary || '(ainda não há resumo)',
    '',
    '# Como responder',
    'O campo `message` é a sua resposta curta para o usuário, na sua persona.',
    'Preencha `proposedChanges` somente quando o usuário pedir ou implicar uma edição no conteúdo; caso contrário, use `null`.',
    'Quando `contentType` for `text`, `proposedChanges` deve ter `contentType: "text"` e `after` com o texto completo proposto.',
    'Quando `contentType` for `todo`, `proposedChanges` deve ter `contentType: "todo"` e `items` com a lista completa resultante: reaproveite o `id` dos itens existentes, marque `diff: "unchanged"` nos mantidos, `diff: "removed"` nos que devem sair (mantenha o `id`) e `diff: "added"` nos novos (sem `id`). Use `order` sequencial.',
    'Atualize `updatedSummary` com um resumo curto e completo da conversa da task até aqui, incorporando este turno.',
  ].join('\n')

  return `${BEN_SYSTEM_PROMPT}${taskSection}`
}

export class GeminiAgentProviderService implements AgentService {
  async generateReply(payload: GenerateReplyPayload): Promise<AgentReply> {
    const result = await generateText({
      model,
      system: buildSystemPrompt(payload.topicIndex),
      prompt: payload.message,
      tools: {
        'get-history-context': buildHistoryContextTool(
          payload.resolveHistoryContext,
        ),
      },
      toolChoice: 'auto',
      stopWhen: stepCountIs(2),
      output: Output.object({ schema: agentReplySchema }),
    })

    return result.output
  }

  async generateTaskTurn(
    payload: GenerateTaskTurnPayload,
  ): Promise<TaskTurnReply> {
    const result = await generateText({
      model,
      system: buildTaskTurnSystemPrompt(payload),
      prompt: payload.message,
      output: Output.object({ schema: taskTurnReplySchema }),
    })

    return result.output
  }
}
