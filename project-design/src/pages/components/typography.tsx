import { Typography } from "@/layout/components/ui/typography";
import { ComponentPreview } from "./_preview";

export function TypographyPreview() {
  return (
    <ComponentPreview
      name="Typography"
      description="Single primitive for every text token. Variants snap to the theme scale in global.css."
      variants={[
        {
          label: "wordmark",
          node: <Typography variant="wordmark">Ben</Typography>,
        },
        {
          label: "headline-lg",
          node: <Typography variant="headline-lg">Your busy-day brain</Typography>,
        },
        {
          label: "tagline",
          node: (
            <Typography variant="tagline" className="text-on-surface-variant">
              Say it, Ben files it.
            </Typography>
          ),
        },
        {
          label: "body-md",
          node: (
            <Typography variant="body-md">
              Tap the mic or type to tell Ben anything.
            </Typography>
          ),
        },
        {
          label: "button-text",
          node: <Typography variant="button-text">Continue</Typography>,
        },
        {
          label: "label-caps",
          node: (
            <Typography
              variant="label-caps"
              className="text-on-surface-variant"
            >
              Suggested Actions
            </Typography>
          ),
        },
      ]}
    />
  );
}
