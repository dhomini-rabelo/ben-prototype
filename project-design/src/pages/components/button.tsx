import { ArrowRight } from "lucide-react";
import { Button } from "@/layout/components/ui/button";
import { ComponentPreview } from "./_preview";

export function ButtonPreview() {
  return (
    <ComponentPreview
      name="Button"
      description="High-contrast primary action. Flat surface, 8px radius, friendly press scale."
      variants={[
        { label: "Default", node: <Button>Continue</Button> },
        {
          label: "With icon",
          node: (
            <Button>
              Get started
              <ArrowRight className="size-4" />
            </Button>
          ),
        },
        {
          label: "Disabled",
          node: (
            <Button disabled className="opacity-50">
              Continue
            </Button>
          ),
        },
        {
          label: "Full width",
          node: <Button className="w-full">Sign in with Google</Button>,
        },
      ]}
    />
  );
}
