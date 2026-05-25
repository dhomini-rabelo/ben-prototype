import { TypingIndicator } from "../../layout/components/ui/typing-indicator";
import { ComponentPreview } from "./_preview";

export function TypingIndicatorPreview() {
  return (
    <ComponentPreview
      name="TypingIndicator"
      description="Ben is composing a reply. Three quiet bouncing dots inside a Ben-styled bubble."
      variants={[{ label: "Default", node: <TypingIndicator /> }]}
    />
  );
}
