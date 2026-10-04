import { ItemDetailSheet } from "@/layout/components/workspace/item-detail-sheet";
import { DetailShell } from "@/layout/components/common/detail-shell";

export function ItemDetailEdgeCasesPage() {
  return (
    <DetailShell
      sheet={
        <ItemDetailSheet
          kind="note"
          variant="gone"
          title="this one's gone"
        />
      }
    />
  );
}
