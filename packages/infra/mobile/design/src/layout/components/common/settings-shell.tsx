import type { ReactNode } from "react";

type SettingsShellProps = {
  sheet: ReactNode;
};

export function SettingsShell({ sheet }: SettingsShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center bg-surface text-on-surface">
      {/* Faint chat backdrop */}
      <div className="pointer-events-none absolute inset-0 flex w-full max-w-120 self-center flex-col px-4 pt-20 pb-44 opacity-30">
        <div className="ml-auto rounded-2xl rounded-tr-sm bg-surface-container-low px-4 py-3 text-body-md">
          morning. what's on the list today?
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
