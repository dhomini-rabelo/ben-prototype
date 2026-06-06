import { SettingsSheet } from "@/layout/components/settings-sheet";
import { SettingsShell } from "./_settings-shell";

export function MenuSettingsLoading() {
  return <SettingsShell sheet={<SettingsSheet variant="loading" />} />;
}
