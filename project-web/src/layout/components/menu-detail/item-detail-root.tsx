import { Bell, NotebookPen, X } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { MenuSheet } from "@/layout/components/menu/menu-sheet";
import { Typography } from "@/layout/components/ui/typography";

type ItemKind = "note" | "reminder";

type ItemDetailRootProps = {
  kind: ItemKind;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
};

const KIND_META: Record<
  ItemKind,
  {
    label: string;
    icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  }
> = {
  note: { label: "Note", icon: NotebookPen },
  reminder: { label: "Reminder", icon: Bell },
};

export function ItemDetailRoot({
  kind,
  children,
  onClose,
  className,
}: ItemDetailRootProps) {
  const { label, icon: Icon } = KIND_META[kind];

  return (
    <MenuSheet className={className}>
      <div className="flex items-center justify-between px-5 pt-1 pb-3">
        <span className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
          <Typography variant="label-caps" className="text-on-surface-variant">
            {label}
          </Typography>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex size-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>
      </div>
      {children}
    </MenuSheet>
  );
}
