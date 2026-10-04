import { CapturesCounts } from '@ben/domain-chat/application/use-cases/captures/get-captures-counts'

export class CapturesCountsPresenter {
  static toHttp(counts: CapturesCounts): CapturesCounts {
    return {
      tasks: { active: counts.tasks.active },
      notes: { total: counts.notes.total },
      reminders: { total: counts.reminders.total },
    }
  }
}
