import { cn } from "../utils/styles";
import { BenLogo } from "./icons/ben-logo";
import { Typography } from "./ui/typography";

type BrandMarkProps = {
  orientation?: "row" | "column";
  logoWidth?: number;
  logoHeight?: number;
  className?: string;
  itemClassName?: string;
};

export function BrandMark({
  orientation = "row",
  logoWidth,
  logoHeight,
  className,
  itemClassName,
}: BrandMarkProps) {
  return (
    <div
      className={cn(
        "flex items-center",
        orientation === "row" ? "flex-row gap-2.5" : "flex-col",
        className,
      )}
    >
      <BenLogo
        className={cn("text-primary", itemClassName)}
        width={logoWidth}
        height={logoHeight}
      />
      <Typography
        variant="wordmark"
        className={cn("text-primary", itemClassName)}
      >
        Ben
      </Typography>
    </div>
  );
}
