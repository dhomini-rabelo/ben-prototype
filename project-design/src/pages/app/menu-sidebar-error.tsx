import { MenuSidebar } from "../../layout/components/menu-sidebar";
import { MenuShell } from "./_menu-shell";

export function MenuSidebarError() {
  return <MenuShell panel={<MenuSidebar variant="error" />} />;
}
