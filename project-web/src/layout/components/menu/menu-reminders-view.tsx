import { AlertCircle } from "lucide-react";
import { ChatBanner } from "@/layout/components/chat-banner";
import { Typography } from "@/layout/components/ui/typography";
import { useReminderListData } from "@/layout/hooks/api/use-reminder-list-data";
import { firesAtRelative, relativeTime } from "@/layout/utils/format-time";
import { MenuListRow } from "./menu-list-row";
import { MenuListShell } from "./menu-list-shell";
import { MenuListLoading } from "./menu-tasks-view";

type MenuRemindersViewProps = {
  onBack: () => void;
  onSelect: (reminderId: string) => void;
};

export function MenuRemindersView({
  onBack,
  onSelect,
}: MenuRemindersViewProps) {
  const { actions, state } = useReminderListData();
  const reminders = state.data?.items ?? [];
  const upcoming = reminders.filter((reminder) => reminder.status === "upcoming");
  const fired = reminders.filter((reminder) => reminder.status === "fired");

  return (
    <MenuListShell title="Reminders" onBack={onBack}>
      {state.isLoading ? (
        <MenuListLoading />
      ) : state.isError ? (
        <div className="pt-4">
          <ChatBanner.Root tone="error">
            <ChatBanner.Icon icon={AlertCircle} />
            <ChatBanner.Text>couldn't load your reminders</ChatBanner.Text>
            <ChatBanner.Action label="retry" onClick={() => actions.refetch()} />
          </ChatBanner.Root>
        </div>
      ) : reminders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <Typography variant="body-md" className="text-on-surface">
            no reminders yet
          </Typography>
          <Typography variant="body-md" className="mt-1 text-on-surface-variant">
            say{" "}
            <span className="font-mono text-[14px] text-on-surface">
              "remind me to…"
            </span>{" "}
            and Ben'll catch it.
          </Typography>
        </div>
      ) : (
        <section className="flex flex-col gap-2">
          {upcoming.length > 0 && (
            <>
              <Typography
                variant="label-caps"
                className="px-3 pt-2 text-on-surface-variant"
              >
                Upcoming
              </Typography>
              <div className="flex flex-col">
                {upcoming.map((reminder) => (
                  <MenuListRow
                    key={reminder.id}
                    kind="reminder"
                    title={reminder.title}
                    trailing={firesAtRelative(reminder.firesAt)}
                    emphasizeTrailing
                    supporting={`captured ${relativeTime(reminder.capturedAt)}`}
                    onClick={() => onSelect(reminder.id)}
                  />
                ))}
              </div>
            </>
          )}

          {fired.length > 0 && (
            <>
              <Typography
                variant="label-caps"
                className="mt-4 px-3 text-on-surface-variant"
              >
                Fired
              </Typography>
              <div className="flex flex-col">
                {fired.map((reminder) => (
                  <MenuListRow
                    key={reminder.id}
                    kind="reminder"
                    title={reminder.title}
                    trailing={firesAtRelative(reminder.firesAt)}
                    supporting="fired"
                    muted
                    onClick={() => onSelect(reminder.id)}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </MenuListShell>
  );
}
