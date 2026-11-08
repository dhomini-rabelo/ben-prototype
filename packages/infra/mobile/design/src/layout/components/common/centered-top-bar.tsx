import { BrandMark } from "@/layout/components/common/brand-mark";

export function CenteredTopBar() {
  return (
    <div className="flex h-16 items-center justify-center">
      <BrandMark logoWidth={28} logoHeight={22} />
      <span className="ml-3 border-l border-outline-variant pl-3 text-[13px] font-medium text-on-surface-variant">
        Sat, Nov 7
      </span>
    </div>
  );
}
