const SKELETON_ROWS = [0, 1, 2];

export function TaskPickerSkeleton() {
  return (
    <div className="flex flex-col gap-1 px-3 pb-4">
      {SKELETON_ROWS.map((index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl px-2 py-2.5"
        >
          <div className="size-8 animate-pulse rounded-lg bg-outline-variant/40" />
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-outline-variant/40" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-outline-variant/30" />
          </div>
        </div>
      ))}
    </div>
  );
}
