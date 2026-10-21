import { CaptureView } from '@ben/domain-chat/application/types/capture-view'
import { NoteRepository } from '@ben/domain-chat/application/repositories/note'
import { ReminderRepository } from '@ben/domain-chat/application/repositories/reminder'
import { TaskRepository } from '@ben/domain-task/application/repositories/task'
import {
  GoalDraft,
  NoteDraft,
  ReminderAlert,
  ReminderDraft,
  TaskDraft,
} from '@ben/adapters'
import { computeNextFireAt } from '@ben/domain-chat/application/utils/reminders'
import {
  Reminder,
  ReminderProps,
} from '@ben/domain-chat/enterprise/entities/reminder'
import { ID, createID } from '@ben/domain-base'
import { ListingResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  newReminders: ReminderDraft[]
  newNotes: NoteDraft[]
  newTasks: TaskDraft[]
  newGoals: GoalDraft[]
  timeZone: string
  morningTime: string
}

type Schedule = { timeZone: string; morningTime: string }

const AT_EVENT_ALERTS: ReminderAlert[] = [{ kind: 'at-event' }]

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

    const schedule = {
      timeZone: payload.timeZone,
      morningTime: payload.morningTime,
    }
    const reminderViews = await this.createReminderViews(
      userId,
      payload.newReminders,
      now,
      schedule,
    )
    const goalViews = await this.createGoalViews(
      userId,
      payload.newGoals,
      now,
      schedule,
    )
    const taskViews = await this.createTaskViews(userId, payload.newTasks, now)
    const noteViews = await this.createNoteViews(userId, payload.newNotes, now)

    return {
      items: [...reminderViews, ...goalViews, ...taskViews, ...noteViews],
    }
  }

  private async createReminderViews(
    userId: ID,
    drafts: ReminderDraft[],
    now: Date,
    schedule: Schedule,
  ): Promise<CaptureView[]> {
    const reminderViews: CaptureView[] = []

    for (const draft of drafts) {
      const remindAt = draft.remindAt ?? null
      const isConditional = draft.kind === 'conditional'
      const alerts = draft.alerts?.length ? draft.alerts : AT_EVENT_ALERTS
      const reminder = await this.createReminder(userId, now, schedule, {
        title: draft.title,
        notes: draft.notes ?? null,
        kind: isConditional ? 'conditional' : 'alarm',
        remindAt: isConditional ? null : remindAt,
        alerts: isConditional ? [] : alerts,
        checkFrequency: isConditional
          ? (draft.checkFrequency ?? { type: 'daily' })
          : null,
        recurrence: null,
        messages: [],
      })
      reminderViews.push(this.toReminderView(reminder))
    }

    return reminderViews
  }

  private async createGoalViews(
    userId: ID,
    drafts: GoalDraft[],
    now: Date,
    schedule: Schedule,
  ): Promise<CaptureView[]> {
    const goalViews: CaptureView[] = []

    for (const draft of drafts) {
      const goal = await this.createReminder(userId, now, schedule, {
        title: draft.title,
        notes: null,
        kind: 'goal',
        remindAt: draft.startsAt,
        alerts: AT_EVENT_ALERTS,
        checkFrequency: null,
        recurrence: draft.recurrence,
        messages: draft.messages,
      })
      goalViews.push(this.toReminderView(goal))
    }

    return goalViews
  }

  private async createReminder(
    userId: ID,
    now: Date,
    schedule: Schedule,
    data: Pick<
      ReminderProps,
      | 'title'
      | 'notes'
      | 'kind'
      | 'remindAt'
      | 'alerts'
      | 'checkFrequency'
      | 'recurrence'
      | 'messages'
    >,
  ) {
    const props: ReminderProps = {
      ...data,
      userId,
      status: 'active',
      timeZone: schedule.timeZone,
      acknowledgedUntil: null,
      snoozedUntil: null,
      nextFireAt: null,
      completedAt: null,
      createdAt: now,
    }
    props.nextFireAt = computeNextFireAt(props, schedule.morningTime)

    return this.reminderRepository.create(props)
  }

  private toReminderView(reminder: Reminder): CaptureView {
    return {
      kind: 'reminder',
      itemId: reminder.id.toValue(),
      title: reminder.props.title,
      meta: reminder.props.remindAt,
    }
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
