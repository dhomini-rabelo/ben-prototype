import { BrandMark } from "@/layout/components/brand-mark";
import { ComponentPreview } from "./_preview";

export function BrandMarkPreview() {
  return (
    <ComponentPreview
      name="BrandMark"
      description="Ben wordmark + logo lockup. Use in nav and onboarding."
      variants={[
        {
          label: "Row (default)",
          node: <BrandMark logoWidth={28} logoHeight={22} />,
        },
        {
          label: "Column",
          node: (
            <BrandMark orientation="column" logoWidth={40} logoHeight={32} />
          ),
        },
        {
          label: "Compact",
          node: <BrandMark logoWidth={20} logoHeight={16} />,
        },
      ]}
    />
  );
}
