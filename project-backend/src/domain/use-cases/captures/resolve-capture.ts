import { CaptureView } from '@/adapters/capture-view'
import { NoteRepository } from '@/adapters/repositories/note-repository'
import { ReminderRepository } from '@/adapters/repositories/reminder-repository'
import { TaskRepository } from '@/adapters/repositories/task-repository'
import { MessageCapture } from '@/domain/entities/message'
import { ID } from '@/modules/domain/entity/id'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  capture: MessageCapture
}

export class ResolveCaptureUseCase implements UseCase<CaptureView | null> {
  constructor(
    private noteRepository: NoteRepository,
    private reminderRepository: ReminderRepository,
    private taskRepository: TaskRepository,
  ) {}

  async execute(payload: Payload): Promise<CaptureView | null> {
    const { kind, itemId } = payload.capture
    const id = new ID(itemId)

    if (kind === 'reminder') {
      const reminder = await this.reminderRepository.findUnique({ id })
      if (!reminder) return null
      return {
        kind,
        itemId,
        title: reminder.props.title,
        meta: reminder.props.remindAt ?? null,
      }
    }

    if (kind === 'task') {
      const task = await this.taskRepository.findUnique({ id })
      if (!task) return null
      return { kind, itemId, title: task.props.title, meta: null }
    }

    const note = await this.noteRepository.findUnique({ id })
    if (!note) return null
    return { kind, itemId, title: note.props.title, meta: null }
  }
}
