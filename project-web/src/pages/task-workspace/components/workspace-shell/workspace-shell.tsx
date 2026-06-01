import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

const FOOTER_GAP = 16;

type WorkspaceShellProps = {
  topBar: ReactNode;
  topBanner?: ReactNode;
  banner?: ReactNode;
  diffBar?: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

export function WorkspaceShell({
  topBar,
  topBanner,
  banner,
  diffBar,
  footer,
  children,
}: WorkspaceShellProps) {
  const footerRef = useRef<HTMLElement | null>(null);
  const [footerHeight, setFooterHeight] = useState(0);

  useLayoutEffect(() => {
    const node = footerRef.current;
    if (!node) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setFooterHeight(entry.contentRect.height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative flex min-h-dvh flex-col items-center bg-surface text-on-surface">
      <header className="fixed top-0 left-1/2 z-50 flex w-full max-w-120 -translate-x-1/2 flex-col bg-surface">
        {topBar}
        {topBanner && <div className="px-4 pb-2">{topBanner}</div>}
      </header>

      <main
        className="flex w-full max-w-120 flex-1 flex-col px-5 pt-16"
        style={{ paddingBottom: footerHeight + FOOTER_GAP }}
      >
        {children}
      </main>

      <footer
        ref={footerRef}
        className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-120 -translate-x-1/2 flex-col gap-2 bg-surface px-4 pt-2 pb-6"
      >
        {banner}
        {diffBar}
        {footer}
      </footer>
    </div>
  );
}
