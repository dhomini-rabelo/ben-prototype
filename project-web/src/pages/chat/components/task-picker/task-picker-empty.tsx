import { Typography } from "../../../../layout/components/ui/typography";

export function TaskPickerEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 px-5 pt-4 pb-6 text-center">
      <Typography variant="body-md" className="text-on-surface">
        nothing active — you're all clear
      </Typography>
      <Typography
        variant="label-caps"
        className="normal-case text-on-surface-variant"
      >
        tap outside to head back to chat
      </Typography>
    </div>
  );
}
