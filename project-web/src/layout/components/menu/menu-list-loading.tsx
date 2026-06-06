const SKELETON_ROWS = [0, 1, 2, 3, 4];

export function MenuListLoading() {
  return (
    <div className="flex flex-col gap-1 pt-2">
      {SKELETON_ROWS.map((index) => (
        <div key={index} className="flex items-start gap-3 rounded-xl px-3 py-3">
          <div className="size-9 animate-pulse rounded-lg bg-outline-variant/40" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-outline-variant/40" />
            <div className="h-3 w-full animate-pulse rounded bg-outline-variant/30" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-outline-variant/30" />
          </div>
        </div>
      ))}
    </div>
  );
}
