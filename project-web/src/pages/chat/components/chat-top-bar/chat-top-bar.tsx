import { Menu } from "lucide-react";
import { memo } from "react";
import { BrandMark } from "../../../../layout/components/brand-mark";
import { IconButton } from "../../../../layout/components/ui/icon-button";

function ChatTopBarComponent() {
  return (
    <div className="flex h-16 items-center justify-between px-6">
      <BrandMark logoWidth={28} logoHeight={22} />
      <IconButton label="Menu">
        <Menu className="size-6" />
      </IconButton>
    </div>
  );
}

export const ChatTopBar = memo(ChatTopBarComponent);
