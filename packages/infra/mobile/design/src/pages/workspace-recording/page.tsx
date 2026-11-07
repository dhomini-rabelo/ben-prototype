import { RecordingBar } from "@/layout/components/chat/recording-bar";
import { Typography } from "@/layout/components/ui/typography";
import { WorkspaceShell } from "@/layout/components/common/workspace-shell";

export function WorkspaceRecordingPage() {
  return (
    <WorkspaceShell
      title="Draft the Q3 brief"
      contentType="text"
      overlay={
        <div className="pointer-events-none fixed inset-0 z-30 bg-on-surface/10" />
      }
      footer={<RecordingBar elapsed="0:04" />}
    >
      <section className="flex flex-1 flex-col gap-4 pt-2 opacity-40">
        <Typography
          variant="body-md"
          className="leading-relaxed text-on-surface"
        >
          Q3 is the quarter we stop apologizing for the rough edges…
        </Typography>
      </section>
    </WorkspaceShell>
  );
}
