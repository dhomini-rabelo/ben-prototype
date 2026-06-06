import { TaskPickerSheet } from "@/layout/components/task-picker-sheet";
import { PickerShell } from "./_picker-shell";

export function TaskPickerEmpty() {
  return (
    <PickerShell sheet={<TaskPickerSheet variant="empty" />} peekCount={0} />
  );
}
