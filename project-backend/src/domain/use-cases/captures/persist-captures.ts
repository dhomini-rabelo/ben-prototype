import { CaptureView } from '@/adapters/capture-view'
import { NoteRepository } from '@/adapters/repositories/note-repository'
import { ReminderRepository } from '@/adapters/repositories/reminder-repository'
import { TaskRepository } from '@/adapters/repositories/task-repository'
import { NoteDraft, ReminderDraft, TaskDraft } from '@/adapters/agent-provider'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  newReminders: ReminderDraft[]
  newNotes: NoteDraft[]
  newTasks: TaskDraft[]
}

export class PersistCapturesUseCase implements UseCase<CaptureView[]> {
  constructor(
    private noteRepository: NoteRepository,
    private reminderRepository: ReminderRepository,
    private taskRepository: TaskRepository,
  ) {}

  async execute(payload: Payload): Promise<CaptureView[]> {
    const now = new Date()
    const reminderViews: CaptureView[] = []
    const taskViews: CaptureView[] = []
    const noteViews: CaptureView[] = []

    for (const draft of payload.newReminders) {
      const remindAt = draft.remindAt ?? null
      const reminder = await this.reminderRepository.create({
        userId: payload.userId,
        title: draft.title,
        remindAt,
        notes: draft.notes ?? null,
        createdAt: now,
      })
      reminderViews.push({
        kind: 'reminder',
        itemId: reminder.id.toValue(),
        title: reminder.props.title,
        meta: remindAt,
      })
    }

    for (const draft of payload.newTasks) {
      const task = await this.taskRepository.create({
        userId: payload.userId,
        title: draft.title,
        details: draft.details ?? null,
        status: 'pending',
        createdAt: now,
      })
      taskViews.push({
        kind: 'task',
        itemId: task.id.toValue(),
        title: task.props.title,
        meta: null,
      })
    }

    for (const draft of payload.newNotes) {
      const note = await this.noteRepository.create({
        userId: payload.userId,
        title: draft.title,
        body: draft.body,
        createdAt: now,
      })
      noteViews.push({
        kind: 'note',
        itemId: note.id.toValue(),
        title: note.props.title,
        meta: null,
      })
    }

    return [...reminderViews, ...taskViews, ...noteViews]
  }
}
