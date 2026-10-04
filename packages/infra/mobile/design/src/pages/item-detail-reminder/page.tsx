import { ItemDetailSheet } from "@/layout/components/workspace/item-detail-sheet";
import { DetailShell } from "@/layout/components/common/detail-shell";

export function ItemDetailReminderPage() {
  return (
    <DetailShell
      sheet={
        <ItemDetailSheet
          kind="reminder"
          title="Call mom"
          firesAtRelative="in 2h"
          firesAtAbsolute="Sat, May 24 · 9:00 AM"
          status="upcoming"
          capturedAtAbsolute="May 23, 2026 · 6:58 AM"
          capturedAtRelative="this morning"
        />
      }
    />
  );
}
