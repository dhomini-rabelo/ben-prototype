import type { ReactNode } from "react";
import { cn } from "../../core/cn";
import { WorkspaceTopBar } from "../../layout/components/ui/workspace-top-bar";

type WorkspaceShellProps = {
  title: string;
  contentType?: "text" | "list";
  finishedIndicator?: boolean;
  topBanner?: ReactNode;
  banner?: ReactNode;
  diffBar?: ReactNode;
  footer: ReactNode;
  overlay?: ReactNode;
  bodyClassName?: string;
  children: ReactNode;
};

export function WorkspaceShell({
  title,
  contentType = "text",
  finishedIndicator,
  topBanner,
  banner,
  diffBar,
  footer,
  overlay,
  bodyClassName,
  children,
}: WorkspaceShellProps) {
  const hasFooterExtras = banner || diffBar;

  return (
    <div className="relative flex min-h-dvh flex-col items-center bg-surface text-on-surface">
      <header className="fixed top-0 left-1/2 z-40 flex w-full max-w-120 -translate-x-1/2 flex-col bg-surface">
        <WorkspaceTopBar
          title={title}
          contentType={contentType}
          finishedIndicator={finishedIndicator}
        />
        {topBanner && <div className="px-4 pb-2">{topBanner}</div>}
      </header>

      <main
        className={cn(
          "flex w-full max-w-120 flex-1 flex-col px-5 pt-16",
          hasFooterExtras ? "pb-60" : "pb-44",
          bodyClassName,
        )}
      >
        {children}
      </main>

      <footer className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-120 -translate-x-1/2 flex-col gap-2 bg-surface px-4 pt-2 pb-6">
        {banner}
        {diffBar}
        {footer}
      </footer>

      {overlay}
    </div>
  );
}
