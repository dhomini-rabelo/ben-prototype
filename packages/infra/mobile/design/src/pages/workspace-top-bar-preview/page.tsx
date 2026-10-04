import { WorkspaceTopBar } from "@/layout/components/workspace/workspace-top-bar";
import { PreviewShell } from "@/layout/components/common/preview-shell";

export function WorkspaceTopBarPreviewPage() {
  return (
    <PreviewShell
      name="WorkspaceTopBar"
      description="Persistent chrome at the top of a task workspace — back, content-type icon + title, overflow."
      variants={[
        {
          label: "Text task",
          node: <WorkspaceTopBar title="Draft the Q3 brief" contentType="text" />,
        },
        {
          label: "List task",
          node: (
            <WorkspaceTopBar title="Packing for the offsite" contentType="list" />
          ),
        },
        {
          label: "Finished indicator",
          node: (
            <WorkspaceTopBar
              title="Annual review notes"
              contentType="text"
              finishedIndicator
            />
          ),
        },
      ]}
    />
  );
}
