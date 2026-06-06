import { Bell, ListTodo, NotebookPen, Settings } from "lucide-react";
import type { ComponentType } from "react";
import { BrandMark } from "@/layout/components/brand-mark";
import { Typography } from "@/layout/components/ui/typography";
import { type MenuEntryId, useMenuStore } from "@/layout/stores/menu-store";
import { cn } from "@/layout/utils/styles";

type MenuSidebarProps = {
  className?: string;
};

const ENTRIES: {
  id: MenuEntryId;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "notes", label: "Notes", icon: NotebookPen },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export function MenuSidebar({ className }: MenuSidebarProps) {
  const selectEntry = useMenuStore((store) => store.selectEntry);

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col bg-surface-container-lowest shadow-[8px_0_32px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      <div className="flex h-16 items-center px-5">
        <BrandMark logoWidth={24} logoHeight={19} />
      </div>

      <nav className="flex flex-col px-2 pt-2">
        {ENTRIES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => selectEntry(id)}
            className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-left hover:bg-surface-container-low"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
              <Icon className="size-4" strokeWidth={1.75} />
            </span>
            <Typography
              variant="body-md"
              className="flex-1 font-semibold text-on-surface"
            >
              {label}
            </Typography>
          </button>
        ))}
      </nav>
    </aside>
  );
}
