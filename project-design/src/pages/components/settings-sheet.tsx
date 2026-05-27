import { SettingsSheet } from "../../layout/components/settings-sheet";
import { ComponentPreview } from "./_preview";

export function SettingsSheetPreview() {
  return (
    <ComponentPreview
      name="SettingsSheet"
      description="Bottom-sheet modal opened from the menu sidebar's Settings entry. Minimal profile section + a single Sign-out action. Handles loading and error states for the profile and the sign-out flow."
      variants={[
        {
          label: "Populated",
          node: (
            <div className="w-full">
              <SettingsSheet
                name="Sam Carter"
                email="sam.carter@example.com"
              />
            </div>
          ),
        },
        {
          label: "Loading",
          node: (
            <div className="w-full">
              <SettingsSheet variant="loading" />
            </div>
          ),
        },
        {
          label: "Error — profile failed",
          node: (
            <div className="w-full">
              <SettingsSheet
                variant="error"
                email="sam.carter@example.com"
              />
            </div>
          ),
        },
        {
          label: "Signing out",
          node: (
            <div className="w-full">
              <SettingsSheet
                name="Sam Carter"
                email="sam.carter@example.com"
                signOutState="pending"
              />
            </div>
          ),
        },
        {
          label: "Sign-out failed",
          node: (
            <div className="w-full">
              <SettingsSheet
                name="Sam Carter"
                email="sam.carter@example.com"
                signOutState="failed"
              />
            </div>
          ),
        },
      ]}
    />
  );
}
