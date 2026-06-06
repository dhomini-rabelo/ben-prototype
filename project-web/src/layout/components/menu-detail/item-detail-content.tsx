import type { ReactNode } from "react";
import { Typography } from "@/layout/components/ui/typography";
import { ItemDetailCapturedMeta } from "./item-detail-captured-meta";
import { ItemDetailReminderMeta } from "./item-detail-reminder-meta";

type ItemDetailContentProps = {
  title?: string;
  body?: ReactNode;
  capturedAtAbsolute?: string;
  capturedAtRelative?: string;
  firesAtRelative?: string;
  firesAtAbsolute?: string;
  status?: "upcoming" | "fired";
};

export function ItemDetailContent({
  title,
  body,
  capturedAtAbsolute,
  capturedAtRelative,
  firesAtRelative,
  firesAtAbsolute,
  status,
}: ItemDetailContentProps) {
  return (
    <div className="flex flex-col gap-3 px-5 pb-5">
      {title && (
        <Typography
          variant="headline-lg"
          className="leading-tight text-on-surface"
        >
          {title}
        </Typography>
      )}

      {(firesAtRelative || firesAtAbsolute) && (
        <ItemDetailReminderMeta
          firesAtRelative={firesAtRelative}
          firesAtAbsolute={firesAtAbsolute}
          status={status}
        />
      )}

      {body && (
        <div className="max-h-72 overflow-y-auto pr-1">
          <Typography
            variant="body-md"
            className="leading-relaxed text-on-surface"
          >
            {body}
          </Typography>
        </div>
      )}

      {(capturedAtAbsolute || capturedAtRelative) && (
        <ItemDetailCapturedMeta
          absolute={capturedAtAbsolute}
          relative={capturedAtRelative}
        />
      )}
    </div>
  );
}
