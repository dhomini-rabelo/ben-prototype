import { Typography } from "../../layout/components/ui/typography";

const COLOR_GROUPS: { label: string; swatches: { name: string; token: string; value: string }[] }[] = [
  {
    label: "Surface",
    swatches: [
      { name: "surface", token: "bg-surface", value: "#f9f9f9" },
      { name: "container-low", token: "bg-surface-container-low", value: "#f3f3f4" },
      { name: "container", token: "bg-surface-container", value: "#eeeeee" },
      { name: "container-high", token: "bg-surface-container-high", value: "#e8e8e8" },
      { name: "variant", token: "bg-surface-variant", value: "#e2e2e2" },
    ],
  },
  {
    label: "Primary & ink",
    swatches: [
      { name: "primary", token: "bg-primary", value: "#121213" },
      { name: "on-primary", token: "bg-on-primary border border-outline-variant", value: "#ffffff" },
      { name: "on-surface", token: "bg-on-surface", value: "#1a1c1c" },
      { name: "on-surface-variant", token: "bg-on-surface-variant", value: "#444748" },
      { name: "outline-variant", token: "bg-outline-variant", value: "#c4c7c7" },
    ],
  },
  {
    label: "Feedback",
    swatches: [
      { name: "error", token: "bg-error", value: "#ba1a1a" },
      { name: "surface-error", token: "bg-surface-error border border-outline-variant", value: "#fff5f5" },
      { name: "text-error", token: "bg-text-error", value: "#c53030" },
    ],
  },
];

const TYPE_SAMPLES: { variant: Parameters<typeof Typography>[0]["variant"]; label: string }[] = [
  { variant: "wordmark", label: "Wordmark · 32" },
  { variant: "headline-lg", label: "Headline · 24" },
  { variant: "tagline", label: "Tagline · 18" },
  { variant: "body-md", label: "Body · 16" },
  { variant: "button-text", label: "Button · 15" },
  { variant: "label-caps", label: "Label caps · 12" },
];

const SPACING = [
  { name: "stack-sm", value: "8px" },
  { name: "stack-md", value: "16px" },
  { name: "stack-lg", value: "32px" },
  { name: "margin-edge", value: "24px" },
];

const RADII = [
  { name: "rounded", px: 8, cls: "rounded" },
  { name: "rounded-md", px: 12, cls: "rounded-md" },
  { name: "rounded-lg", px: 16, cls: "rounded-lg" },
  { name: "rounded-xl", px: 24, cls: "rounded-xl" },
  { name: "full", px: 999, cls: "rounded-full" },
];

export function DesignTokens() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface px-6 py-8 text-on-surface">
      <Typography variant="label-caps" className="text-on-surface-variant">
        Design tokens
      </Typography>
      <Typography variant="headline-lg" className="mt-1 mb-6">
        System overview
      </Typography>

      <section className="flex flex-col gap-5">
        {COLOR_GROUPS.map((group) => (
          <div key={group.label}>
            <Typography
              variant="label-caps"
              className="mb-2 text-on-surface-variant"
            >
              {group.label}
            </Typography>
            <div className="grid grid-cols-5 gap-2">
              {group.swatches.map((s) => (
                <div key={s.name} className="flex flex-col gap-1">
                  <div
                    className={`${s.token} aspect-square w-full rounded-md`}
                    title={s.value}
                  />
                  <span className="text-[10px] leading-tight text-on-surface-variant">
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <Typography variant="label-caps" className="mb-3 text-on-surface-variant">
          Typography
        </Typography>
        <div className="flex flex-col gap-3">
          {TYPE_SAMPLES.map((t) => (
            <div
              key={t.variant}
              className="flex items-baseline justify-between gap-3 border-b border-outline-variant/40 pb-2"
            >
              <Typography variant={t.variant} className="text-on-surface">
                {t.variant === "label-caps" ? "Ag · Section" : "Aa · Ben"}
              </Typography>
              <span className="font-mono text-[10px] text-on-surface-variant">
                {t.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <Typography variant="label-caps" className="mb-3 text-on-surface-variant">
          Spacing scale (8px grid)
        </Typography>
        <div className="flex flex-col gap-2">
          {SPACING.map((s) => (
            <div key={s.name} className="flex items-center gap-3">
              <div
                className="h-3 rounded-full bg-primary"
                style={{ width: s.value }}
              />
              <span className="font-mono text-[11px] text-on-surface-variant">
                {s.name} · {s.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <Typography variant="label-caps" className="mb-3 text-on-surface-variant">
          Radius scale
        </Typography>
        <div className="flex items-end gap-3">
          {RADII.map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-1">
              <div
                className={`${r.cls} size-12 bg-surface-container-high ring-1 ring-outline-variant`}
              />
              <span className="font-mono text-[10px] text-on-surface-variant">
                {r.name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
