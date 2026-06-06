import type { ReactNode } from "react";
import { MenuSidebar } from "@/layout/components/menu-sidebar";

type SettingsShellProps = {
  sheet: ReactNode;
};

export function SettingsShell({ sheet }: SettingsShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center bg-surface text-on-surface">
      {/* Sidebar behind */}
      <div className="fixed top-0 bottom-0 left-1/2 z-30 flex h-dvh w-full max-w-120 -translate-x-1/2">
        <div className="flex h-full w-[78%] opacity-60">
          <MenuSidebar counts={{ tasks: 3, notes: 12, reminders: 4 }} />
        </div>
      </div>

      {/* Dim layer over everything */}
      <div className="fixed inset-0 z-40 bg-inverse-surface/40 backdrop-blur-[1px]" />

      {/* Settings sheet — bottom */}
      <div className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-120 -translate-x-1/2 flex-col">
        {sheet}
      </div>
    </div>
  );
}
