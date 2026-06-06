import type { ReactNode } from "react";
import { Typography } from "@/layout/components/ui/typography";

type PreviewProps = {
  name: string;
  description: string;
  variants: { label: string; node: ReactNode; surface?: "default" | "dark" }[];
};

export function ComponentPreview({ name, description, variants }: PreviewProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface px-6 py-8 text-on-surface">
      <Typography variant="label-caps" className="text-on-surface-variant">
        Component
      </Typography>
      <Typography variant="headline-lg" className="mt-1">
        {name}
      </Typography>
      <Typography variant="body-md" className="mt-2 text-on-surface-variant">
        {description}
      </Typography>

      <div className="mt-6 flex flex-col gap-5">
        {variants.map((v) => (
          <div key={v.label} className="flex flex-col gap-2">
            <Typography
              variant="label-caps"
              className="text-on-surface-variant"
            >
              {v.label}
            </Typography>
            <div
              className={`flex flex-wrap items-center gap-3 rounded-lg p-5 ring-1 ring-outline-variant/40 ${
                v.surface === "dark" ? "bg-primary" : "bg-surface-container-low"
              }`}
            >
              {v.node}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
