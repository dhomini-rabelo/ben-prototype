import { useEffect, useRef, useState } from "react";
import { LayoutGrid, Component, Images } from "lucide-react";
import { PAGES, COMPONENTS, type ScreenEntry } from "../../core/screens";

const PREVIEW_WIDTH = 390;
const PREVIEW_HEIGHT = 844;

type Tab = "pages" | "components";

export function Home() {
  const [tab, setTab] = useState<Tab>("pages");

  const items = tab === "pages" ? PAGES : COMPONENTS;
  const noun = tab === "pages" ? "screen" : "component";

  return (
    <div
      className="min-h-screen text-[#e7e9ee]"
      style={{
        backgroundColor: "#0f1115",
        backgroundImage: "radial-gradient(circle, #2a2f3b 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <header className="sticky top-0 z-10 border-b border-[#262b36] bg-[#0f1115]/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center gap-8 px-8 py-4">
          <div className="flex items-center gap-2.5 text-[18px] font-bold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#1c2029] ring-1 ring-[#262b36]">
              <Images className="size-4 text-[#e7e9ee]" />
            </span>
            Ben — Design Gallery
          </div>
          <nav className="ml-auto flex gap-1">
            <TabLink active={tab === "pages"} onClick={() => setTab("pages")}>
              Pages
            </TabLink>
            <TabLink active={tab === "components"} onClick={() => setTab("components")}>
              Components
            </TabLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-8 pb-20 pt-10">
        <div className="mb-7 flex items-baseline justify-between">
          <h1 className="m-0 text-2xl font-semibold tracking-tight">
            {tab === "pages" ? "Pages" : "Components"}
          </h1>
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8a90a0]">
            {items.length} {items.length === 1 ? noun : `${noun}s`}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#262b36] px-5 py-16 text-center text-sm text-[#8a90a0]">
            {tab === "components"
              ? "No components yet. Register reusable components in src/core/screens.ts."
              : "No pages yet. Register screens in src/core/screens.ts."}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {items.map((item) => (
              <ScreenCard key={item.id} item={item} kind={tab} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function TabLink({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-[#1c2029] text-[#e7e9ee]"
          : "text-[#8a90a0] hover:bg-[#1c2029] hover:text-[#e7e9ee]"
      }`}
    >
      {children}
    </button>
  );
}

function ScreenCard({ item, kind }: { item: ScreenEntry; kind: Tab }) {
  const Icon = kind === "pages" ? LayoutGrid : Component;
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setScale(width / PREVIEW_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      href={item.file}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#262b36] bg-[#15181f] transition-all hover:-translate-y-0.5 hover:border-[#3a4150]"
    >
      <div className="flex items-center gap-2 border-b border-[#262b36] bg-[#1c2029] px-3.5 py-2.5 font-mono text-[11px] tracking-wider text-[#8a90a0]">
        <Icon className="size-3.5 opacity-70" />
        <span className="font-medium text-[#e7e9ee]">{item.title}</span>
      </div>
      <div
        ref={previewRef}
        className="relative w-full overflow-hidden bg-[#fdf8f8]"
        style={{ aspectRatio: `${PREVIEW_WIDTH} / ${PREVIEW_HEIGHT}` }}
      >
        <iframe
          src={item.file}
          loading="lazy"
          tabIndex={-1}
          title={item.title}
          className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
          style={{
            width: `${PREVIEW_WIDTH}px`,
            height: `${PREVIEW_HEIGHT}px`,
            transform: `scale(${scale})`,
          }}
        />
        <div className="absolute inset-0" aria-hidden="true" />
      </div>
    </a>
  );
}
