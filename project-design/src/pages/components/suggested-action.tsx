import { Bell, NotebookPen, Sparkles } from "lucide-react";
import { SuggestedAction } from "../../layout/components/ui/suggested-action";
import { ComponentPreview } from "./_preview";

export function SuggestedActionPreview() {
  return (
    <ComponentPreview
      name="SuggestedAction"
      description="Row-shaped quick action. Used in the empty Chat surface to hint at capture verbs."
      variants={[
        {
          label: "Stacked",
          node: (
            <div className="flex w-full flex-col gap-2">
              <SuggestedAction icon={Bell}>Remind me to...</SuggestedAction>
              <SuggestedAction icon={NotebookPen}>
                Create a note about...
              </SuggestedAction>
              <SuggestedAction icon={Sparkles}>
                Plan my day
              </SuggestedAction>
            </div>
          ),
        },
      ]}
    />
  );
}
