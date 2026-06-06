import { ItemDetailSheet } from "@/layout/components/item-detail-sheet";
import { DetailShell } from "./_detail-shell";

export function ItemDetailNote() {
  return (
    <DetailShell
      sheet={
        <ItemDetailSheet
          kind="note"
          title="Try 1:16 pour-over ratio this week"
          body="Try the lighter ratio on the Ethiopia bag — past the third pour, slow the agitation. If it tastes hollow at 1:16, step back to 1:15.5 and adjust the grind one notch finer rather than going back up. Note the result on Sunday before the next bag opens."
          capturedAtAbsolute="May 23, 2026 · 3:47 PM"
          capturedAtRelative="today, 2h ago"
        />
      }
    />
  );
}
