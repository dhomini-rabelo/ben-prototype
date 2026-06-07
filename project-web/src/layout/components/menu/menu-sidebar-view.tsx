import { useCapturesCountsData } from "@/layout/hooks/api/use-captures-counts-data";
import { useMenuStore } from "@/layout/stores/menu-store";
import { MenuSidebar } from "./menu-sidebar";

export function MenuSidebarView() {
  const selectEntry = useMenuStore((store) => store.selectEntry);
  const { state } = useCapturesCountsData();

  const variant = state.isLoading
    ? "loading"
    : state.isError
      ? "error"
      : "default";

  const counts = state.data
    ? {
        tasks: state.data.item.tasks.active,
        notes: state.data.item.notes.total,
        reminders: state.data.item.reminders.total,
      }
    : undefined;

  return (
    <MenuSidebar variant={variant} counts={counts} onSelect={selectEntry} />
  );
}
