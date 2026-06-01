import { AgentService, ProposedTaskChanges } from '@/adapters/agent-provider'
import { TaskRepository } from '@/adapters/repositories/task-repository'
import {
  PendingDiff,
  Task,
  TaskDiffChanges,
  TodoItemWithDiff,
} from '@/domain/entities/task'
import { ID } from '@/modules/domain/entity/id'
import { UseCase } from '@/modules/domain/use-case'
import { loadOwnedTask } from './load-owned-task'

interface Payload {
  userId: string
  taskId: string
  message: string
}

interface Response {
  task: Task
  benMessage: string
}

export class CreateTaskMessageUseCase implements UseCase<Response> {
  constructor(
    private taskRepository: TaskRepository,
    private agentService: AgentService,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    const task = await loadOwnedTask(
      this.taskRepository,
      payload.taskId,
      payload.userId,
    )

    const reply = await this.agentService.generateTaskTurn({
      userId: payload.userId,
      title: task.props.title,
      contentType: task.props.contentType,
      textContent: task.props.textContent,
      todoItems: task.props.todoItems,
      summary: task.props.summary,
      message: payload.message,
    })

    const pendingDiff = reply.proposedChanges
      ? this.buildPendingDiff(task, reply.proposedChanges)
      : null

    const updatedTask = await this.taskRepository.update(task.id, {
      summary: reply.updatedSummary,
      pendingDiff,
      status: 'active',
      lastActivityAt: new Date(),
    })

    return { task: updatedTask, benMessage: reply.message }
  }

  private buildPendingDiff(
    task: Task,
    proposedChanges: ProposedTaskChanges,
  ): PendingDiff {
    const changes: TaskDiffChanges =
      proposedChanges.contentType === 'text'
        ? {
            contentType: 'text',
            before: task.props.textContent ?? '',
            after: proposedChanges.after,
          }
        : {
            contentType: 'todo',
            items: proposedChanges.items.map<TodoItemWithDiff>((item) => ({
              id: item.id ?? new ID().toValue(),
              title: item.title,
              done: item.done,
              order: item.order,
              diff: item.diff,
            })),
          }

    return {
      turnId: new ID().toValue(),
      proposedBy: 'ben',
      changes,
      createdAt: new Date(),
    }
  }
}
