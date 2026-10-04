import { SubThreadBanner } from "@/layout/components/sub-thread-banner";
import { ComponentPreview } from "./_preview";

export function SubThreadBannerPreview() {
  return (
    <ComponentPreview
      name="SubThreadBanner"
      description="Quiet strip above the workspace composer showing the most recent sub-thread message. Tap to expand the full conversation."
      variants={[
        {
          label: "Ben reply",
          node: (
            <SubThreadBanner
              variant="ben-reply"
              text="tightened the intro — want me to take a pass at the closing?"
            />
          ),
        },
        {
          label: "User pending (transcribing)",
          node: (
            <SubThreadBanner
              variant="user-pending"
              meta="You"
              text="rewrite the closing to land on marketing first…"
            />
          ),
        },
        {
          label: "Ben typing",
          node: <SubThreadBanner variant="ben-typing" />,
        },
        {
          label: "Error",
          node: (
            <SubThreadBanner
              variant="error"
              text="Ben couldn't reply"
            />
          ),
        },
      ]}
    />
  );
}
