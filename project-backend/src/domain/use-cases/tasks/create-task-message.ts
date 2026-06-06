import {
  AgentService,
  ProposedTaskChanges,
  TaskTurnReply,
} from '@/adapters/agent-provider'
import { TaskRepository } from '@/adapters/repositories/task-repository'
import {
  PendingDiff,
  Task,
  TaskDiffChanges,
  TodoItemWithDiff,
} from '@/domain/entities/task'
import { createID } from '@/modules/domain/entity/id'
import { ItemResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  taskId: string
  message: string
}

type Response = ItemResponse<Task> & {
  benMessage: string
}

export class CreateTaskMessageUseCase implements UseCase<Response> {
  constructor(
    private taskRepository: TaskRepository,
    private agentService: AgentService,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    const task = await this.taskRepository.get({
      id: createID(payload.taskId),
      userId: createID(payload.userId),
    })

    const reply = await this.generateAgentReply(payload, task)
    const item = await this.applyReplyToTask(task, reply)

    return { item, benMessage: reply.message }
  }

  private generateAgentReply(payload: Payload, task: Task) {
    return this.agentService.generateTaskTurn({
      userId: payload.userId,
      title: task.props.title,
      contentType: task.props.contentType,
      textContent: task.props.textContent,
      todoItems: task.props.todoItems,
      summary: task.props.summary,
      message: payload.message,
    })
  }

  private applyReplyToTask(task: Task, reply: TaskTurnReply): Promise<Task> {
    const pendingDiff = reply.proposedChanges
      ? this.buildPendingDiff(task, reply.proposedChanges)
      : null

    return this.taskRepository.update(task.id, {
      summary: reply.updatedSummary,
      pendingDiff,
      status: 'active',
      lastActivityAt: new Date(),
    })
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
              id: item.id ?? createID().toValue(),
              title: item.title,
              done: item.done,
              order: item.order,
              diff: item.diff,
            })),
          }

    return {
      turnId: createID().toValue(),
      proposedBy: 'ben',
      changes,
      createdAt: new Date(),
    }
  }
}
