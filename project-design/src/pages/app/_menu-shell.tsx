import type { ReactNode } from "react";

type MenuShellProps = {
  panel: ReactNode;
};

export function MenuShell({ panel }: MenuShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center bg-surface text-on-surface">
      {/* Faint chat backdrop */}
      <div className="pointer-events-none absolute inset-0 flex w-full max-w-120 self-center flex-col px-4 pt-20 pb-44 opacity-30">
        <div className="ml-auto rounded-2xl rounded-tr-sm bg-surface-container-low px-4 py-3 text-body-md">
          morning. what's on the list today?
        </div>
      </div>

      {/* Dim layer */}
      <div className="fixed inset-0 z-40 bg-inverse-surface/30 backdrop-blur-[1px]" />

      {/* Sidebar panel — slides in from left, ~75% width */}
      <div className="fixed top-0 bottom-0 left-1/2 z-50 flex h-dvh w-full max-w-120 -translate-x-1/2">
        <div className="flex h-full w-[78%]">{panel}</div>
      </div>
    </div>
  );
}
