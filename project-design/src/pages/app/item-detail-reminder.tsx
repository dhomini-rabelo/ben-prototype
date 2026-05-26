import { ItemDetailSheet } from "../../layout/components/ui/item-detail-sheet";
import { DetailShell } from "./_detail-shell";

export function ItemDetailReminder() {
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
