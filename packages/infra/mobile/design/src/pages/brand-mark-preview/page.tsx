import { BrandMark } from "@/layout/components/common/brand-mark";
import { PreviewShell } from "@/layout/components/common/preview-shell";

export function BrandMarkPreviewPage() {
  return (
    <PreviewShell
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
