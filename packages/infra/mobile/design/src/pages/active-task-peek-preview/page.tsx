import { ActiveTaskPeek } from "@/layout/components/workspace/active-task-peek";
import { PreviewShell } from "@/layout/components/common/preview-shell";

export function ActiveTaskPeekPreviewPage() {
  return (
    <PreviewShell
      name="ActiveTaskPeek"
      description="Always-on strip above the composer surfacing in-progress tasks. Opens the active-task picker on tap."
      variants={[
        {
          label: "Empty (no active tasks)",
          node: <ActiveTaskPeek variant="empty" />,
        },
        {
          label: "Summary — multiple active",
          node: (
            <ActiveTaskPeek
              variant="summary"
              count={3}
              title="Draft the Q3 brief"
            />
          ),
        },
        {
          label: "Summary — single active",
          node: (
            <ActiveTaskPeek
              variant="summary"
              count={1}
              title="Rewrite onboarding email sequence"
            />
          ),
        },
        {
          label: "Skeleton (loading)",
          node: <ActiveTaskPeek variant="skeleton" />,
        },
      ]}
    />
  );
}
