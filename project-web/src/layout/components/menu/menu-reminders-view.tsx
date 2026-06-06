import { useReminderListData } from "@/layout/hooks/api/use-reminder-list-data";
import { MenuListEmpty } from "./menu-list-empty";
import { MenuListError } from "./menu-list-error";
import { MenuListLoading } from "./menu-list-loading";
import { MenuListShell } from "./menu-list-shell";
import { MenuRemindersList } from "./menu-reminders-list";

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

  return (
    <MenuListShell title="Reminders" onBack={onBack}>
      {state.isLoading ? (
        <MenuListLoading />
      ) : state.isError ? (
        <MenuListError
          message="couldn't load your reminders"
          onRetry={() => actions.refetch()}
        />
      ) : reminders.length === 0 ? (
        <MenuListEmpty
          title="no reminders yet"
          description={
            <>
              say{" "}
              <span className="font-mono text-[14px] text-on-surface">
                "remind me to…"
              </span>{" "}
              and Ben'll catch it.
            </>
          }
        />
      ) : (
        <MenuRemindersList reminders={reminders} onSelect={onSelect} />
      )}
    </MenuListShell>
  );
}
