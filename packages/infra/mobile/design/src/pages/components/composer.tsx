import { Composer } from "@/layout/components/composer";
import { ComponentPreview } from "./_preview";

export function ComposerPreview() {
  return (
    <ComponentPreview
      name="Composer (context peek)"
      description="Sits above the input. Pulsing dot signals the active ledger context; chevron collapses."
      variants={[
        { label: "Default", node: <Composer className="w-full" /> },
        {
          label: "Reminders",
          node: <Composer className="w-full" contextLabel="Context: Reminders" />,
        },
        {
          label: "Notes",
          node: <Composer className="w-full" contextLabel="Context: Notes" />,
        },
      ]}
    />
  );
}
