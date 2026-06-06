import type { ReactNode } from "react";
import { Typography } from "@/layout/components/ui/typography";

type MenuListEmptyProps = {
  title: string;
  description: ReactNode;
};

export function MenuListEmpty({ title, description }: MenuListEmptyProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <Typography variant="body-md" className="text-on-surface">
        {title}
      </Typography>
      <Typography variant="body-md" className="mt-1 text-on-surface-variant">
        {description}
      </Typography>
    </div>
  );
}
