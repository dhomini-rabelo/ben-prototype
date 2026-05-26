import { MenuListRow } from "../../layout/components/ui/menu-list-row";
import { MenuListShell } from "./_menu-list-shell";

export function MenuNotesPopulated() {
  return (
    <MenuListShell title="Notes">
      <div className="flex flex-col pt-2">
        <MenuListRow
          kind="note"
          title="Try 1:16 pour-over ratio this week"
          bodyPreview="lighter ratio on the Ethiopia bag — past the third pour, slow agitation…"
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
          title="Birthday gift ideas for Sam"
          bodyPreview="that ceramic mug from the Sunday market, the linen apron she mentioned…"
          trailing="1w ago"
        />
        <MenuListRow
          kind="note"
          title="Refactoring playbook"
          bodyPreview="start from the leaves, never two changes at once, keep tests green between steps"
          trailing="2w ago"
        />
      </div>
    </MenuListShell>
  );
}
