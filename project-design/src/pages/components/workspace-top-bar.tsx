import { WorkspaceTopBar } from "../../layout/components/ui/workspace-top-bar";
import { ComponentPreview } from "./_preview";

export function WorkspaceTopBarPreview() {
  return (
    <ComponentPreview
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
