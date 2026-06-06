import { GenerateTaskTurnPayload } from '@/adapters/agent-provider'
import { BEN_SYSTEM_PROMPT } from '@/infra/services/ben-agent-provider/ben-system-prompt'

export const buildTaskTurnSystemPrompt = (
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
