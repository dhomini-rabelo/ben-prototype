import { LedgerPeek } from "../../layout/components/ui/ledger-peek";
import { ComponentPreview } from "./_preview";

export function LedgerPeekPreview() {
  return (
    <ComponentPreview
      name="LedgerPeek"
      description="Always-on glance strip above the composer. Expands the ledger drawer on tap."
      variants={[
        {
          label: "Empty (first run)",
          node: <LedgerPeek variant="empty" />,
        },
        {
          label: "Up next (near-term reminder)",
          node: (
            <LedgerPeek
              variant="up-next"
              title="Pick up milk on the way home"
              meta="in 2h"
            />
          ),
        },
        {
          label: "Summary (no near-term reminder)",
          node: (
            <LedgerPeek
              variant="summary"
              title="12 notes · 4 tasks · 0 reminders"
            />
          ),
        },
        {
          label: "Skeleton (loading)",
          node: <LedgerPeek variant="skeleton" />,
        },
      ]}
    />
  );
}
