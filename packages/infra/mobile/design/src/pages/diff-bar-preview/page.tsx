import { DiffBar } from "@/layout/components/workspace/diff-bar";
import { PreviewShell } from "@/layout/components/common/preview-shell";

export function DiffBarPreviewPage() {
  return (
    <PreviewShell
      name="DiffBar"
      description="Sits above the workspace composer when Ben has proposed content edits. Approve / Reject are visually equal — both are one-tap, non-destructive."
      variants={[
        {
          label: "Default — 3 changes",
          node: <DiffBar summary="Ben suggested 3 changes" />,
        },
        {
          label: "Default — single change",
          node: <DiffBar summary="Ben suggested 1 change" />,
        },
        { label: "Error — save failed", node: <DiffBar state="error" /> },
      ]}
    />
  );
}
