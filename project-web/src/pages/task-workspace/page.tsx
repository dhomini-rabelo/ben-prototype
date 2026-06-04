import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
import { WorkspaceTopBar } from "./components/workspace-top-bar/workspace-top-bar";
import { useWorkspaceTask } from "./hooks/use-workspace-task";
import { useTaskChatStore } from "./stores/task-chat-store";
import { useTaskStore } from "./stores/task-store";
import { useVoiceStore } from "../../layout/stores/voice-store";

const FOOTER_GAP = 16;

export function TaskWorkspace() {
  const navigate = useNavigate();
  const { taskId = "" } = useParams<{ taskId: string }>();
  const { state, actions } = useTaskDetailData(taskId);
  const task = useWorkspaceTask();
  const setTaskId = useTaskStore((store) => store.setTaskId);

  const footerRef = useRef<HTMLElement | null>(null);
  const [footerHeight, setFooterHeight] = useState(0);

  useConnectivity();

  useEffect(() => {
    useVoiceStore.getState().setTranscriptHandler((text) => {
      void useTaskChatStore.getState().sendText(text);
    });
  }, []);

  useEffect(() => useVoiceStore.getState().subscribeMicPermission(), []);

  useEffect(() => {
    setTaskId(taskId);
    return () => useTaskStore.getState().reset();
  }, [taskId, setTaskId]);

  useLayoutEffect(() => {
    const node = footerRef.current;
    if (!node) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setFooterHeight(entry.contentRect.height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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
    <div className="relative flex min-h-dvh flex-col items-center bg-surface text-on-surface">
      <header className="fixed top-0 left-1/2 z-50 flex w-full max-w-120 -translate-x-1/2 flex-col bg-surface">
        <WorkspaceTopBar />
        <WorkspaceTopBanner />
      </header>

      <main
        className="flex w-full max-w-120 flex-1 flex-col px-5 pt-16"
        style={{ paddingBottom: footerHeight + FOOTER_GAP }}
      >
        {task.contentType === "todo" ? (
          <TodoContent readOnly={isFinished} />
        ) : (
          <TextContent readOnly={isFinished || hasPendingDiff} />
        )}
      </main>

      <footer
        ref={footerRef}
        className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-120 -translate-x-1/2 flex-col gap-2 bg-surface px-4 pt-2 pb-6"
      >
        <WorkspaceSubThreadBanner />
        <DiffBar />
        <WorkspaceFooter />
      </footer>
    </div>
  );
}
