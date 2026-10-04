type BenLogoProps = {
  className?: string;
  width?: number;
  height?: number;
};

export function BenLogo({ className, width = 36, height = 28 }: BenLogoProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 36 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="5" fill="currentColor" />
      <circle cx="22" cy="14" r="6" fill="currentColor" />
      <circle cx="13" cy="22" r="4" fill="currentColor" />
    </svg>
  );
}
