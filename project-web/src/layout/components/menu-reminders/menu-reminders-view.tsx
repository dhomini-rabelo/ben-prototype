import { MenuListEmpty } from "@/layout/components/menu-list/menu-list-empty";
import { MenuListError } from "@/layout/components/menu-list/menu-list-error";
import { MenuListLoading } from "@/layout/components/menu-list/menu-list-loading";
import { MenuListShell } from "@/layout/components/menu-list/menu-list-shell";
import { useReminderListData } from "@/layout/hooks/api/use-reminder-list-data";
import { useMenuStore } from "@/layout/stores/menu-store";
import { MenuRemindersList } from "./menu-reminders-list";

export function MenuRemindersView() {
  const { actions, state } = useReminderListData();
  const goBackToMenu = useMenuStore((store) => store.goBackToMenu);
  const openDetail = useMenuStore((store) => store.openDetail);
  const reminders = state.data?.items ?? [];

  return (
    <MenuListShell title="Reminders" onBack={goBackToMenu}>
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
        <MenuRemindersList
          reminders={reminders}
          onSelect={(id) => openDetail({ kind: "reminder", id })}
        />
      )}
    </MenuListShell>
  );
}
