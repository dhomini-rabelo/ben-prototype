import { NoteRepository } from '@/adapters/repositories/note-repository'
import { ReminderRepository } from '@/adapters/repositories/reminder-repository'
import { TaskRepository } from '@/adapters/repositories/task-repository'
import { ID, createID } from '@/modules/domain/entity/id'
import { NotEqualQuery } from '@/modules/domain/repository/queries'
import { ItemResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
}

export interface CapturesCounts {
  tasks: { active: number }
  notes: { total: number }
  reminders: { total: number }
}

export class GetCapturesCountsUseCase implements UseCase<
  ItemResponse<CapturesCounts>
> {
  constructor(
    private noteRepository: NoteRepository,
    private reminderRepository: ReminderRepository,
    private taskRepository: TaskRepository,
  ) {}

  async execute(payload: Payload): Promise<ItemResponse<CapturesCounts>> {
    const userId = createID(payload.userId)

    const item: CapturesCounts = {
      tasks: { active: await this.countActiveTasks(userId) },
      notes: { total: await this.countNotes(userId) },
      reminders: { total: await this.countReminders(userId) },
    }

    return { item }
  }

  private countActiveTasks(userId: ID): Promise<number> {
    return this.taskRepository.count({
      userId,
      status: new NotEqualQuery({ input: 'finished' }),
    })
  }

  private countNotes(userId: ID): Promise<number> {
    return this.noteRepository.count({ userId })
  }

  private countReminders(userId: ID): Promise<number> {
    return this.reminderRepository.count({ userId })
  }
}
