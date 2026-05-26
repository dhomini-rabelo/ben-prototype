import { SettingsSheet } from "../../layout/components/ui/settings-sheet";
import { SettingsShell } from "./_settings-shell";

export function MenuSettingsLoading() {
  return <SettingsShell sheet={<SettingsSheet variant="loading" />} />;
}
