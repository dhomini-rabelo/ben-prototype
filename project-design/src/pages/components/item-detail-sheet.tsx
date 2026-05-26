import { ItemDetailSheet } from "../../layout/components/ui/item-detail-sheet";
import { ComponentPreview } from "./_preview";

export function ItemDetailSheetPreview() {
  return (
    <ComponentPreview
      name="ItemDetailSheet"
      description="Modal sheet that slides up over chat to show the full content of a note or reminder. Read-only in v1. Triggered by tapping a note/reminder capture card or a row in the menu sidebar."
      variants={[
        {
          label: "Note detail",
          node: (
            <ItemDetailSheet
              kind="note"
              title="Try 1:16 pour-over ratio this week"
              body="Try the lighter ratio on the Ethiopia bag — past the third pour, slow the agitation. Note the result on Sunday."
              capturedAtAbsolute="May 23, 2026 · 3:47 PM"
              capturedAtRelative="today, 2h ago"
            />
          ),
        },
        {
          label: "Reminder detail — upcoming",
          node: (
            <ItemDetailSheet
              kind="reminder"
              title="Call mom"
              firesAtRelative="in 2h"
              firesAtAbsolute="Sat, May 24 · 9:00 AM"
              status="upcoming"
              capturedAtAbsolute="May 23, 2026 · 6:58 AM"
              capturedAtRelative="this morning"
            />
          ),
        },
        {
          label: "Reminder detail — fired",
          node: (
            <ItemDetailSheet
              kind="reminder"
              title="Call mom"
              firesAtRelative="fired 3h ago"
              firesAtAbsolute="Sat, May 24 · 9:00 AM"
              status="fired"
              capturedAtAbsolute="May 23, 2026 · 6:58 AM"
              capturedAtRelative="yesterday"
            />
          ),
        },
        {
          label: "Loading",
          node: <ItemDetailSheet kind="note" variant="loading" />,
        },
        {
          label: "Error",
          node: <ItemDetailSheet kind="note" variant="error" />,
        },
        {
          label: "Edge — item gone",
          node: <ItemDetailSheet kind="note" variant="gone" />,
        },
      ]}
    />
  );
}
