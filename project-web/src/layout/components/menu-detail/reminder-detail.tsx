import { isAxiosError } from "axios";
import { useReminderDetailData } from "@/layout/hooks/api/use-reminder-detail-data";
import {
  absoluteDateTime,
  firesAtRelative,
  relativeTime,
} from "@/layout/utils/format-time";
import { ItemDetailSheet } from "./item-detail-sheet";

type ReminderDetailProps = {
  reminderId: string;
  onClose: () => void;
};

export function ReminderDetail({ reminderId, onClose }: ReminderDetailProps) {
  const { actions, state } = useReminderDetailData(reminderId);
  const reminder = state.data?.item;

  if (state.isLoading) {
    return (
      <ItemDetailSheet kind="reminder" variant="loading" onClose={onClose} />
    );
  }

  if (state.isError) {
    const isGone = isAxiosError(state.error) && state.error.response?.status === 404;
    return (
      <ItemDetailSheet
        kind="reminder"
        variant={isGone ? "gone" : "error"}
        onClose={onClose}
        onRetry={() => actions.refetch()}
      />
    );
  }

  if (!reminder) {
    return (
      <ItemDetailSheet kind="reminder" variant="gone" onClose={onClose} />
    );
  }

  return (
    <ItemDetailSheet
      kind="reminder"
      title={reminder.title}
      body={reminder.body ?? undefined}
      status={reminder.status}
      firesAtRelative={firesAtRelative(reminder.firesAt)}
      firesAtAbsolute={
        reminder.firesAt ? absoluteDateTime(reminder.firesAt) : undefined
      }
      capturedAtAbsolute={absoluteDateTime(reminder.capturedAt)}
      capturedAtRelative={relativeTime(reminder.capturedAt)}
      onClose={onClose}
    />
  );
}
