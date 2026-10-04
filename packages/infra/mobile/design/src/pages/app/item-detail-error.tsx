import { ItemDetailSheet } from "@/layout/components/item-detail-sheet";
import { DetailShell } from "./_detail-shell";

export function ItemDetailError() {
  return (
    <DetailShell
      sheet={<ItemDetailSheet kind="note" variant="error" />}
    />
  );
}
