import { TaskPickerSheet } from "@/layout/components/workspace/task-picker-sheet";
import { PickerShell } from "@/layout/components/common/picker-shell";

export function TaskPickerEmptyPage() {
  return (
    <PickerShell sheet={<TaskPickerSheet variant="empty" />} peekCount={0} />
  );
}
