import { SettingsSheet } from "@/layout/components/menu/settings-sheet";
import { SettingsShell } from "@/layout/components/common/settings-shell";

export function MenuSettingsEdgeCasesPage() {
  return (
    <SettingsShell
      sheet={
        <SettingsSheet
          name="Sam Carter"
          email="sam.carter@example.com"
          signOutState="failed"
        />
      }
    />
  );
}
