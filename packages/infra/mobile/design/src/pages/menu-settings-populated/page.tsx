import { SettingsSheet } from "@/layout/components/menu/settings-sheet";
import { SettingsShell } from "@/layout/components/common/settings-shell";

export function MenuSettingsPopulatedPage() {
  return (
    <SettingsShell
      sheet={
        <SettingsSheet
          name="Sam Carter"
          email="sam.carter@example.com"
        />
      }
    />
  );
}
