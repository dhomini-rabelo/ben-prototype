// Script de AMBIENTE, não de feature. Vive fora de project-backend/src de propósito
// (ver r4-ambiente-tarefa.md, regra "nenhum script entra no commit da feature").
//
// Importa os módulos do backend por CAMINHO ABSOLUTO (não por alias "@/...") porque
// este arquivo mora fora da árvore de project-backend: a resolução de módulos do
// Node parte do diretório de cada arquivo, então um alias "@/..." só resolve dentro
// de arquivos que já estão sob project-backend/src. Os módulos importados aqui (jwt,
// prisma, repositórios) usam "@/..." internamente e resolvem normalmente, porque
// eles PRÓPRIOS estão fisicamente dentro de project-backend/src.
//
// Uso (funciona de qualquer cwd, mas rode a partir de project-backend por hábito):
//
//   cd /root/so/repos/ben-prototype/project-backend && \
//     npx tsx /root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/seed-ambiente.ts
//
// Opcional: passe um texto como primeiro argumento para customizar o conteúdo da
// mensagem do bot.
//
// O que faz:
// 1. Reaproveita o usuário de teste (por providerId fixo) se já existir; senão cria.
// 2. Insere uma mensagem do Ben (role: "ben") já persistida e visível no chat.
// 3. Imprime o JWT (mesmo JwtService e mesmo payload { userId } que o login de
//    verdade gera) assinado com o JWT_PRIVATE_KEY do .env.development, para colar em
//    localStorage (chave "ben.jwttoken") no app web.
//
// Idempotente: rodar de novo reaproveita o mesmo usuário e cria só mais uma
// mensagem do bot — é isso que o "comando para semear outra mensagem de bot" do
// r4-ambiente.md deve rodar.

import { createID } from '/root/so/repos/ben-prototype/project-backend/src/modules/domain/entity/id.ts'
import { env } from '/root/so/repos/ben-prototype/project-backend/src/infra/services/env.ts'
import { getPrismaClient } from '/root/so/repos/ben-prototype/project-backend/src/infra/services/prisma.ts'
import { JsonWebTokenJwtService } from '/root/so/repos/ben-prototype/project-backend/src/infra/services/jwt.ts'
import { SqliteUserRepository } from '/root/so/repos/ben-prototype/project-backend/src/infra/services/repositories/sqlite-user-repository.ts'
import { SqliteMessageRepository } from '/root/so/repos/ben-prototype/project-backend/src/infra/services/repositories/sqlite-message-repository.ts'

const TEST_USER_PROVIDER_ID = 'dev-seed-provider-id'

const BOT_MESSAGE_TEXT =
  process.argv[2] ??
  'oi! sou o Ben, sua segunda memória. semeei essa mensagem direto no banco ' +
    'porque o ambiente de teste não tem chave de LLM de verdade.'

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
    console.log(`[seed] usuário criado com id ${user.id.toValue()}`)
  } else {
    console.log(`[seed] usuário já existia, reaproveitado: ${user.id.toValue()}`)
  }

  const botMessage = await messageRepository.create({
    userId: createID(user.id.toValue()),
    role: 'ben',
    content: BOT_MESSAGE_TEXT,
    capture: null,
    createdAt: new Date(),
  })
  console.log(`[seed] mensagem do bot criada: ${botMessage.id.toValue()}`)

  const token = jwtService.generateToken(user.id.toValue())
  console.log('')
  console.log('[seed] userId:', user.id.toValue())
  console.log('[seed] JWT (cole em localStorage["ben.jwttoken"] no app web):')
  console.log(token)

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('[seed] falhou:', error)
  process.exitCode = 1
})
