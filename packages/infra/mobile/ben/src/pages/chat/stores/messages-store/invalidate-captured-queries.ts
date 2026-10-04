import { authClient } from '@/api/client'
import { queryClient } from '@/core/query-client'
import type { CaptureKind } from '@/api/models/message'
import type { ReminderListItem } from '@/api/models/reminder'
import { API_ROUTES } from '@/api/routes'
import type { AgentReply } from '@/api/responses/agent-reply'
import type { ListingResponse } from '@/api/types'
import { syncReminderNotifications } from '@/services/notifications-service'

const LIST_ROUTE_BY_KIND: Record<CaptureKind, string> = {
  note: API_ROUTES.notes.list,
  task: API_ROUTES.tasks.list,
  reminder: API_ROUTES.reminders.list,
}

async function scheduleCapturedReminders() {
  const listing = await queryClient.fetchQuery<
    ListingResponse<ReminderListItem>
  >({
    queryKey: [API_ROUTES.reminders.list, undefined],
    queryFn: async () => {
      const response = await authClient.get<ListingResponse<ReminderListItem>>(
        API_ROUTES.reminders.list,
      )
      return response.data
    },
  })
  await syncReminderNotifications(listing.items)
}

export function invalidateCapturedQueries(reply: AgentReply) {
  const capturedKinds = new Set<CaptureKind>()

  if (reply.newNotes.length > 0) capturedKinds.add('note')
  if (reply.newTasks.length > 0) capturedKinds.add('task')
  if (reply.newReminders.length > 0) capturedKinds.add('reminder')
  if (reply.capture) capturedKinds.add(reply.capture.kind)

  if (capturedKinds.size === 0) return

  for (const kind of capturedKinds) {
    queryClient.invalidateQueries({ queryKey: [LIST_ROUTE_BY_KIND[kind]] })
  }

  queryClient.invalidateQueries({ queryKey: [API_ROUTES.captures.counts] })

  if (capturedKinds.has('reminder')) {
    void scheduleCapturedReminders()
  }
}
