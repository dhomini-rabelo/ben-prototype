import { ItemDetailSheet } from "@/layout/components/workspace/item-detail-sheet";
import { DetailShell } from "@/layout/components/common/detail-shell";

export function ItemDetailLoadingPage() {
  return (
    <DetailShell
      sheet={<ItemDetailSheet kind="note" variant="loading" />}
    />
  );
}
