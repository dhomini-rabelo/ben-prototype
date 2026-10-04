import { CaptureView } from '@/adapters/capture-view'
import { NoteRepository } from '@/adapters/repositories/note-repository'
import { ReminderRepository } from '@/adapters/repositories/reminder-repository'
import { TaskRepository } from '@/adapters/repositories/task-repository'
import { NoteDraft, ReminderDraft, TaskDraft } from '@/adapters/agent-provider'
import { ID, createID } from '@/modules/domain/entity/id'
import { ListingResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  newReminders: ReminderDraft[]
  newNotes: NoteDraft[]
  newTasks: TaskDraft[]
}

export class PersistCapturesUseCase implements UseCase<
  ListingResponse<CaptureView>
> {
  constructor(
    private noteRepository: NoteRepository,
    private reminderRepository: ReminderRepository,
    private taskRepository: TaskRepository,
  ) {}

  async execute(payload: Payload): Promise<ListingResponse<CaptureView>> {
    const now = new Date()
    const userId = createID(payload.userId)

    const reminderViews = await this.createReminderViews(
      userId,
      payload.newReminders,
      now,
    )
    const taskViews = await this.createTaskViews(userId, payload.newTasks, now)
    const noteViews = await this.createNoteViews(userId, payload.newNotes, now)

    return { items: [...reminderViews, ...taskViews, ...noteViews] }
  }

  private async createReminderViews(
    userId: ID,
    drafts: ReminderDraft[],
    now: Date,
  ): Promise<CaptureView[]> {
    const reminderViews: CaptureView[] = []

    for (const draft of drafts) {
      const remindAt = draft.remindAt ?? null
      const reminder = await this.reminderRepository.create({
        userId,
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

    return reminderViews
  }

  private async createTaskViews(
    userId: ID,
    drafts: TaskDraft[],
    now: Date,
  ): Promise<CaptureView[]> {
    const taskViews: CaptureView[] = []

    for (const draft of drafts) {
      const todoItems =
        draft.contentType === 'todo'
          ? (draft.todoItems ?? []).map((title, index) => ({
              id: createID().toValue(),
              title,
              done: false,
              order: index,
            }))
          : null

      const task = await this.taskRepository.create({
        userId,
        messageId: null,
        title: draft.title,
        contentType: draft.contentType,
        textContent:
          draft.contentType === 'text' ? (draft.textContent ?? '') : null,
        todoItems,
        pendingDiff: null,
        summary: '',
        status: 'created',
        lastActivityAt: now,
        finishedAt: null,
        createdAt: now,
      })
      taskViews.push({
        kind: 'task',
        itemId: task.id.toValue(),
        title: task.props.title,
        meta: null,
      })
    }

    return taskViews
  }

  private async createNoteViews(
    userId: ID,
    drafts: NoteDraft[],
    now: Date,
  ): Promise<CaptureView[]> {
    const noteViews: CaptureView[] = []

    for (const draft of drafts) {
      const note = await this.noteRepository.create({
        userId,
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

    return noteViews
  }
}
