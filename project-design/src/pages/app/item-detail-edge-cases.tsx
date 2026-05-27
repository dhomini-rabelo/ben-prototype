import { ItemDetailSheet } from "../../layout/components/item-detail-sheet";
import { DetailShell } from "./_detail-shell";

export function ItemDetailEdgeCases() {
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
