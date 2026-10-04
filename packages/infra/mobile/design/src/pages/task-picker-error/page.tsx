import { TaskPickerSheet } from "@/layout/components/workspace/task-picker-sheet";
import { PickerShell } from "@/layout/components/common/picker-shell";

export function TaskPickerErrorPage() {
  return <PickerShell sheet={<TaskPickerSheet variant="error" />} />;
}
