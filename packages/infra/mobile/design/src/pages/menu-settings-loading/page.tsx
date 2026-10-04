import { SettingsSheet } from "@/layout/components/menu/settings-sheet";
import { SettingsShell } from "@/layout/components/common/settings-shell";

export function MenuSettingsLoadingPage() {
  return <SettingsShell sheet={<SettingsSheet variant="loading" />} />;
}
