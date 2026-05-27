import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { BrandMark } from "../../layout/components/brand-mark";
import { IconButton } from "../../layout/components/ui/icon-button";

type ChatShellProps = {
  children: ReactNode;
  footer: ReactNode;
  peek?: ReactNode;
  topBanner?: ReactNode;
  bodyClassName?: string;
};

export function ChatShell({
  children,
  footer,
  peek,
  topBanner,
  bodyClassName,
}: ChatShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center bg-surface text-on-surface">
      <header className="fixed top-0 left-1/2 z-50 flex h-16 w-full max-w-120 -translate-x-1/2 flex-col bg-surface">
        <div className="flex h-16 items-center justify-between px-6">
          <BrandMark logoWidth={28} logoHeight={22} />
          <IconButton label="Menu">
            <Menu className="size-6" />
          </IconButton>
        </div>
        {topBanner && <div className="px-4 pb-2">{topBanner}</div>}
      </header>

      <main
        className={
          "flex w-full max-w-120 flex-1 flex-col px-4 pt-20 " +
          (peek ? "pb-60 " : "pb-44 ") +
          (bodyClassName ?? "")
        }
      >
        {children}
      </main>

      <footer className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-120 -translate-x-1/2 flex-col gap-2 bg-surface px-4 pt-2 pb-6">
        {peek}
        {footer}
      </footer>
    </div>
  );
}
