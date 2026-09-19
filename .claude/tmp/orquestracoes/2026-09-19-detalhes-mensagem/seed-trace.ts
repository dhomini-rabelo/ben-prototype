// Script de AMBIENTE/TESTE, não de feature. Vive fora de project-backend/src de
// propósito (mesmo motivo do seed-ambiente.ts). Cria uma mensagem do bot com um
// AgentCallTrace completo e realista, para testar visualmente o sheet "Ver
// input"/"Ver output" sem depender de uma chave de LLM real.
//
// Uso:
//   cd /root/so/repos/ben-prototype/project-backend && \
//     npx tsx /root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/seed-trace.ts

import { createID } from '/root/so/repos/ben-prototype/project-backend/src/modules/domain/entity/id.ts'
import { env } from '/root/so/repos/ben-prototype/project-backend/src/infra/services/env.ts'
import { getPrismaClient } from '/root/so/repos/ben-prototype/project-backend/src/infra/services/prisma.ts'
import { JsonWebTokenJwtService } from '/root/so/repos/ben-prototype/project-backend/src/infra/services/jwt.ts'
import { SqliteUserRepository } from '/root/so/repos/ben-prototype/project-backend/src/infra/services/repositories/sqlite-user-repository.ts'
import { SqliteMessageRepository } from '/root/so/repos/ben-prototype/project-backend/src/infra/services/repositories/sqlite-message-repository.ts'

const TEST_USER_PROVIDER_ID = 'dev-seed-provider-id'

async function main() {
  const prisma = getPrismaClient()
  const userRepository = new SqliteUserRepository(prisma)
  const messageRepository = new SqliteMessageRepository(prisma)
  const jwtService = new JsonWebTokenJwtService({
    privateKey: env.JWT_PRIVATE_KEY,
    expirationTimeInSeconds: env.JWT_EXPIRATION_TIME_IN_SECONDS,
  })

  let user = await userRepository.findUnique({
    providerId: TEST_USER_PROVIDER_ID,
  })

  if (!user) {
    user = await userRepository.create({
      name: 'Dev Seed',
      username: 'dev-seed',
      email: 'dev-seed@example.com',
      avatarUrl: '',
      providerId: TEST_USER_PROVIDER_ID,
      createdAt: new Date(),
    })
    console.log(`[seed-trace] usuário criado com id ${user.id.toValue()}`)
  } else {
    console.log(`[seed-trace] usuário já existia, reaproveitado: ${user.id.toValue()}`)
  }

  const startedAt = new Date(Date.now() - 1800).toISOString()
  const finishedAt = new Date().toISOString()

  const trace = {
    status: 'ok',
    error: null,
    modelId: 'gpt-5.6-luna',
    startedAt,
    finishedAt,
    latencyMs: 1800,
    totalUsage: {
      inputTokens: 812,
      outputTokens: 143,
      totalTokens: 955,
      reasoningTokens: 0,
    },
    steps: [
      {
        phase: 'context',
        stepNumber: 1,
        input: {
          systemPrompt:
            'Você é o Ben, uma segunda memória para o usuário. Responda de forma direta, curta e ' +
            'gentil. Use as tools disponíveis para buscar contexto no histórico quando necessário. ' +
            'Nunca invente informação que não esteja no histórico ou nas tools.'.repeat(3),
          messages: [
            { role: 'user', text: 'Oi Ben, tudo bem?', content: { type: 'text', text: 'Oi Ben, tudo bem?' } },
            {
              role: 'ben',
              text: 'Tudo ótimo! Como posso ajudar hoje?',
              content: { type: 'text', text: 'Tudo ótimo! Como posso ajudar hoje?' },
            },
            {
              role: 'user',
              text: 'Me lembra o que eu anotei sobre o projeto X semana passada.',
              content: {
                type: 'text',
                text: 'Me lembra o que eu anotei sobre o projeto X semana passada.',
              },
            },
          ],
          tools: [
            {
              name: 'search_history',
              description: 'Busca mensagens e notas antigas por palavra-chave.',
              inputSchema: {
                type: 'object',
                properties: { query: { type: 'string' } },
                required: ['query'],
              },
            },
            {
              name: 'create_note',
              description: 'Cria uma nota nova para o usuário.',
              inputSchema: {
                type: 'object',
                properties: { title: { type: 'string' }, content: { type: 'string' } },
                required: ['title', 'content'],
              },
            },
          ],
          outputSchema: null,
          requestBody: {
            model: 'gpt-5.6-luna',
            temperature: 0.4,
            max_tokens: 1024,
          },
        },
        output: {
          text: '',
          object: null,
          toolCalls: [
            {
              toolCallId: 'call_1',
              toolName: 'search_history',
              input: { query: 'projeto X' },
            },
          ],
          toolResults: [
            {
              toolCallId: 'call_1',
              toolName: 'search_history',
              output: {
                matches: [
                  { id: 'note-1', title: 'Projeto X - kickoff', snippet: 'Definimos escopo e prazos...' },
                ],
              },
            },
          ],
          finishReason: 'tool-calls',
          warnings: [],
        },
        modelId: 'gpt-5.6-luna',
        responseId: 'resp_step1_abc123',
        usage: {
          inputTokens: 512,
          outputTokens: 48,
          totalTokens: 560,
          reasoningTokens: 0,
        },
        startedAt,
        finishedAt: new Date(Date.now() - 900).toISOString(),
        latencyMs: 900,
      },
      {
        phase: 'format',
        stepNumber: 2,
        input: {
          systemPrompt: 'Formate a resposta final para o usuário em tom direto e gentil.',
          messages: [
            {
              role: 'tool',
              text: 'search_history resultado: Projeto X - kickoff',
              content: { type: 'tool-result', toolCallId: 'call_1' },
            },
          ],
          tools: [],
          outputSchema: null,
          requestBody: { model: 'gpt-5.6-luna', temperature: 0.4 },
        },
        output: {
          text:
            'Na semana passada você anotou sobre o kickoff do Projeto X: definimos escopo e prazos ' +
            'principais. Quer que eu detalhe algum ponto específico?',
          object: null,
          toolCalls: [],
          toolResults: [],
          finishReason: 'stop',
          warnings: [],
        },
        modelId: 'gpt-5.6-luna',
        responseId: 'resp_step2_def456',
        usage: {
          inputTokens: 300,
          outputTokens: 95,
          totalTokens: 395,
          reasoningTokens: 0,
        },
        startedAt: new Date(Date.now() - 900).toISOString(),
        finishedAt,
        latencyMs: 900,
      },
    ],
  }

  const botMessage = await messageRepository.create({
    userId: createID(user.id.toValue()),
    role: 'ben',
    content:
      'Na semana passada você anotou sobre o kickoff do Projeto X: definimos escopo e prazos ' +
      'principais. Quer que eu detalhe algum ponto específico?',
    capture: null,
    trace,
    createdAt: new Date(),
  } as never)
  console.log(`[seed-trace] mensagem do bot com trace criada: ${botMessage.id.toValue()}`)

  const token = jwtService.generateToken(user.id.toValue())
  console.log('')
  console.log('[seed-trace] userId:', user.id.toValue())
  console.log('[seed-trace] JWT (cole em localStorage["ben.jwttoken"] no app web):')
  console.log(token)

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('[seed-trace] falhou:', error)
  process.exitCode = 1
})
