import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { JWT_COOKIE } from "../../api/client";
import { ROUTES } from "../../core/routes";
import { Typography } from "../../layout/components/ui/typography";
import { useTaskDetailData } from "../../layout/hooks/api/use-task-detail-data";
import { useConnectivity } from "../../layout/hooks/use-connectivity";
import { DiffBar } from "./components/diff-bar/diff-bar";
import { WorkspaceSubThreadBanner } from "./components/workspace-sub-thread-banner";
import { WorkspaceTopBanner } from "./components/workspace-top-banner";
import { WorkspaceFooter } from "./components/workspace-footer/workspace-footer";
import { TextContent } from "./components/text-content/text-content";
import { TodoContent } from "./components/todo-content/todo-content";
import { WorkspaceShell } from "./components/workspace-shell/workspace-shell";
import { WorkspaceTopBar } from "./components/workspace-top-bar/workspace-top-bar";
import { useWorkspaceTask } from "./hooks/use-workspace-task";
import { useTaskStore } from "./stores/task-store";
import { useVoiceStore } from "./stores/voice-store";

export function TaskWorkspace() {
  const navigate = useNavigate();
  const { taskId = "" } = useParams<{ taskId: string }>();
  const { state, actions } = useTaskDetailData(taskId);
  const task = useWorkspaceTask();
  const setTaskId = useTaskStore((store) => store.setTaskId);

  useConnectivity();

  useEffect(() => {
    if (!Cookies.get(JWT_COOKIE)) {
      navigate(ROUTES.login);
    }
  }, [navigate]);

  useEffect(() => useVoiceStore.getState().subscribeMicPermission(), []);

  useEffect(() => {
    setTaskId(taskId);
    return () => useTaskStore.getState().reset();
  }, [taskId, setTaskId]);

  if (state.isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface px-6 text-on-surface">
        <Typography variant="body-md" className="text-on-surface-variant">
          loading your workspace…
        </Typography>
      </div>
    );
  }

  if (state.isError || !task) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface px-6 text-center text-on-surface">
        <Typography variant="body-md" className="text-on-surface-variant">
          couldn't load this one
        </Typography>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void actions.refetch()}
            className="rounded-full bg-primary px-4 py-2 text-button font-semibold text-on-primary"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.chat)}
            className="rounded-full bg-surface-container-high px-4 py-2 text-button font-semibold text-on-surface"
          >
            Back to chat
          </button>
        </div>
      </div>
    );
  }

  const isFinished = task.status === "finished";
  const hasPendingDiff = task.pendingDiff !== null;

  return (
    <WorkspaceShell
      topBar={<WorkspaceTopBar />}
      topBanner={<WorkspaceTopBanner />}
      banner={<WorkspaceSubThreadBanner />}
      diffBar={<DiffBar />}
      footer={<WorkspaceFooter />}
    >
      {task.contentType === "todo" ? (
        <TodoContent readOnly={isFinished} />
      ) : (
        <TextContent readOnly={isFinished || hasPendingDiff} />
      )}
    </WorkspaceShell>
  );
}
