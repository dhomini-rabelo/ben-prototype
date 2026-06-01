import {
  AgentReply,
  AgentService,
  GenerateReplyPayload,
  ResolveHistoryContext,
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
  details: z.string().optional(),
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
}
