import type { ReactNode } from "react";
import { Typography } from "@/layout/components/ui/typography";

type ChatBannerTextProps = {
  children: ReactNode;
};

export function ChatBannerText({ children }: ChatBannerTextProps) {
  return (
    <Typography variant="body-md" className="flex-1 text-[15px] leading-snug">
      {children}
    </Typography>
  );
}
