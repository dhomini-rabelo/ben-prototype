import { TaskPickerSheet } from "../../layout/components/ui/task-picker-sheet";
import { PickerShell } from "./_picker-shell";

export function TaskPickerLoading() {
  return <PickerShell sheet={<TaskPickerSheet variant="loading" />} />;
}
