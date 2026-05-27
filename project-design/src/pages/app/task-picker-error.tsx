import { TaskPickerSheet } from "../../layout/components/task-picker-sheet";
import { PickerShell } from "./_picker-shell";

export function TaskPickerError() {
  return <PickerShell sheet={<TaskPickerSheet variant="error" />} />;
}
