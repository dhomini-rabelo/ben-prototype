import { Bell, Menu, Mic, Plus } from "lucide-react";
import { IconButton } from "@/layout/components/ui/icon-button";
import { PreviewShell } from "@/layout/components/common/preview-shell";

export function IconButtonPreviewPage() {
  return (
    <PreviewShell
      name="IconButton"
      description="Circular tap target (40px) for nav and inline actions."
      variants={[
        {
          label: "Default",
          node: (
            <>
              <IconButton label="Menu">
                <Menu className="size-6" />
              </IconButton>
              <IconButton label="Add">
                <Plus className="size-5" />
              </IconButton>
              <IconButton label="Notifications">
                <Bell className="size-5" />
              </IconButton>
              <IconButton label="Voice">
                <Mic className="size-5" />
              </IconButton>
            </>
          ),
        },
      ]}
    />
  );
}
