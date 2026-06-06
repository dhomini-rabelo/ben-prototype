import { CaptureView } from '@/adapters/capture-view'
import { NoteRepository } from '@/adapters/repositories/note-repository'
import { ReminderRepository } from '@/adapters/repositories/reminder-repository'
import { TaskRepository } from '@/adapters/repositories/task-repository'
import { MessageCapture } from '@/domain/entities/message'
import { ID } from '@/modules/domain/entity/id'
import { ItemResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  capture: MessageCapture
}

export class ResolveCaptureUseCase implements UseCase<
  ItemResponse<CaptureView | null>
> {
  constructor(
    private noteRepository: NoteRepository,
    private reminderRepository: ReminderRepository,
    private taskRepository: TaskRepository,
  ) {}

  async execute(payload: Payload): Promise<ItemResponse<CaptureView | null>> {
    const item = await this.resolveCaptureView(payload.capture)

    return { item }
  }

  private resolveCaptureView(
    capture: MessageCapture,
  ): Promise<CaptureView | null> {
    const id = capture.itemId

    if (capture.kind === 'reminder') {
      return this.resolveReminderView(id, capture.itemId.toValue())
    }

    if (capture.kind === 'task') {
      return this.resolveTaskView(id, capture.itemId.toValue())
    }

    return this.resolveNoteView(id, capture.itemId.toValue())
  }

  private async resolveReminderView(
    id: ID,
    itemId: string,
  ): Promise<CaptureView | null> {
    const reminder = await this.reminderRepository.findUnique({ id })
    if (!reminder) return null
    return {
      kind: 'reminder',
      itemId,
      title: reminder.props.title,
      meta: reminder.props.remindAt ?? null,
    }
  }

  private async resolveTaskView(
    id: ID,
    itemId: string,
  ): Promise<CaptureView | null> {
    const task = await this.taskRepository.findUnique({ id })
    if (!task) return null
    return { kind: 'task', itemId, title: task.props.title, meta: null }
  }

  private async resolveNoteView(
    id: ID,
    itemId: string,
  ): Promise<CaptureView | null> {
    const note = await this.noteRepository.findUnique({ id })
    if (!note) return null
    return { kind: 'note', itemId, title: note.props.title, meta: null }
  }
}
