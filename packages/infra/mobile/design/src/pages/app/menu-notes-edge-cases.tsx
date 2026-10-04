import { MenuListRow } from "@/layout/components/menu-list-row";
import { MenuListShell } from "./_menu-list-shell";

export function MenuNotesEdgeCases() {
  return (
    <MenuListShell title="Notes">
      <div className="flex flex-col pt-2">
        <MenuListRow
          kind="note"
          title="A very long note title that should truncate cleanly on the row to keep the layout calm"
          bodyPreview="a body preview that is also intentionally long so we can see ellipsis behavior on a single row in this list view"
          trailing="today"
        />
        <MenuListRow
          kind="note"
          title="Quick thought"
          bodyPreview="orange — the third can to the left."
          trailing="today"
        />
        <MenuListRow
          kind="note"
          title="Books to revisit this summer"
          bodyPreview="A Pattern Language, The Timeless Way of Building, the new Murakami…"
          trailing="yesterday"
        />
        <MenuListRow
          kind="note"
          title="Wiring closet inventory"
          bodyPreview="3× cat6 patches, 1× spare PoE injector, label maker is in the kitchen drawer"
          trailing="3d ago"
        />
        <MenuListRow
          kind="note"
          title="Refactoring playbook"
          bodyPreview="start from the leaves, never two changes at once, keep tests green between steps"
          trailing="2w ago"
        />
        <MenuListRow
          kind="note"
          title="Sourdough notes"
          bodyPreview="hydration up to 78%, autolyse 45min, fold 4× across 2.5h, retard overnight…"
          trailing="3w ago"
        />
        <MenuListRow
          kind="note"
          title="Trip prep — Lisbon"
          bodyPreview="Pastéis de Belém before 10am, taxi from Cais do Sodré is fine, walking shoes…"
          trailing="last month"
        />
      </div>
    </MenuListShell>
  );
}
