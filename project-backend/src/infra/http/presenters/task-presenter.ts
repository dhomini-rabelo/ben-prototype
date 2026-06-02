import { PendingDiff, Task, TaskProps } from '@/domain/entities/task'
import { Serialize, WithID } from '@/modules/domain/types'
import { OverWrite } from '@/modules/utils/types'

export class TaskPresenter {
  static toHttp(
    task: Task,
  ): OverWrite<
    Omit<Serialize<WithID<TaskProps>>, 'userId' | 'messageId'>,
    { pendingDiff: Serialize<PendingDiff> | null }
  > {
    return {
      id: task.id.toValue(),
      title: task.props.title,
      contentType: task.props.contentType,
      textContent: task.props.textContent,
      todoItems: task.props.todoItems,
      pendingDiff: TaskPresenter.pendingDiffToHttp(task.props.pendingDiff),
      summary: task.props.summary,
      status: task.props.status,
      lastActivityAt: task.props.lastActivityAt.toISOString(),
      finishedAt: task.props.finishedAt
        ? task.props.finishedAt.toISOString()
        : null,
      createdAt: task.props.createdAt.toISOString(),
    }
  }

  static toListItemHttp(
    task: Task,
  ): Pick<
    Serialize<WithID<TaskProps>>,
    'id' | 'title' | 'contentType' | 'status' | 'lastActivityAt' | 'createdAt'
  > & { hasPendingDiff: boolean } {
    return {
      id: task.id.toValue(),
      title: task.props.title,
      contentType: task.props.contentType,
      status: task.props.status,
      hasPendingDiff: task.props.pendingDiff !== null,
      lastActivityAt: task.props.lastActivityAt.toISOString(),
      createdAt: task.props.createdAt.toISOString(),
    }
  }

  private static pendingDiffToHttp(
    pendingDiff: PendingDiff | null,
  ): Serialize<PendingDiff> | null {
    if (!pendingDiff) {
      return null
    }

    return {
      turnId: pendingDiff.turnId,
      proposedBy: pendingDiff.proposedBy,
      changes: pendingDiff.changes,
      createdAt: pendingDiff.createdAt.toISOString(),
    }
  }
}
