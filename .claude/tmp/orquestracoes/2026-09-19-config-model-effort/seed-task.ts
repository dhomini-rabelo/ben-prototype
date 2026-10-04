// Script de AMBIENTE/TESTE, não de feature. Vive fora de project-backend/src de propósito
// (mesma regra do seed-ambiente.ts em .../2026-09-19-detalhes-mensagem/: nenhum script de
// seed entra no commit da feature de config-model-and-effort).
//
// Semeia uma task direto no SQLite para o r8 (teste no browser) poder exercitar a rota
// POST /tasks/:id/messages/create sem depender de uma chamada real ao modelo (o ambiente
// de teste não tem chave de LLM de verdade — tasks só nasceriam de persistCapturesUseCase
// dentro de POST /chat, que a chave falsa impede).
//
// Uso:
//   cd /root/so/repos/ben-prototype/project-backend && NODE_ENV=development \
//     npx tsx /root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-config-model-effort/seed-task.ts

import { getPrismaClient } from '/root/so/repos/ben-prototype/project-backend/src/infra/services/prisma.ts'
import { SqliteUserRepository } from '/root/so/repos/ben-prototype/project-backend/src/infra/services/repositories/sqlite-user-repository.ts'
import { SqliteTaskRepository } from '/root/so/repos/ben-prototype/project-backend/src/infra/services/repositories/sqlite-task-repository.ts'

const TEST_USER_PROVIDER_ID = 'dev-seed-provider-id'

async function main() {
  const prisma = getPrismaClient()
  const userRepository = new SqliteUserRepository(prisma)
  const taskRepository = new SqliteTaskRepository(prisma)

  const user = await userRepository.findUnique({
    providerId: TEST_USER_PROVIDER_ID,
  })

  if (!user) {
    throw new Error(
      '[seed-task] usuário de teste não encontrado — rode antes o seed-ambiente.ts de ' +
        '.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/',
    )
  }

  const task = await taskRepository.create({
    userId: user.id,
    messageId: null,
    title: 'Task semeada para o teste de modelo/effort',
    contentType: 'text',
    textContent: 'conteudo inicial',
    todoItems: null,
    pendingDiff: null,
    summary: 'task criada direto no banco porque nao ha chave de LLM no ambiente',
    status: 'active',
    lastActivityAt: new Date(),
    finishedAt: null,
    createdAt: new Date(),
  })
  console.log('taskId:', task.id.toValue())

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('[seed-task] falhou:', error)
  process.exitCode = 1
})
