import { ItemDetailSheet } from "../../layout/components/ui/item-detail-sheet";
import { DetailShell } from "./_detail-shell";

export function ItemDetailLoading() {
  return (
    <DetailShell
      sheet={<ItemDetailSheet kind="note" variant="loading" />}
    />
  );
}
