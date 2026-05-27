import { BrandMark } from "../../layout/components/brand-mark";
import { Button } from "../../layout/components/ui/button";
import { Typography } from "../../layout/components/ui/typography";

export function LoginLoading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-on-background">
      <main className="flex w-full max-w-[320px] flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <BrandMark orientation="column" />
          <Typography
            variant="tagline"
            className="max-w-[280px] text-secondary"
          >
            your busy-day brain — say it, Ben files it
          </Typography>
        </div>
        <Button
          disabled
          aria-busy="true"
          className="w-full cursor-default opacity-90 hover:bg-primary active:scale-100 active:bg-primary"
        >
          <span className="size-2 animate-pulse rounded-full bg-on-primary" />
          Redirecting…
        </Button>
        <footer className="flex flex-col items-center gap-2 pt-2">
          <Typography
            variant="label-caps"
            className="normal-case font-sans tracking-normal text-secondary"
          >
            © 2026 Ben. Your busy-day brain.
          </Typography>
          <nav className="flex items-center gap-4">
            <a
              href="#"
              className="text-label-caps font-medium text-primary hover:underline"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-label-caps font-medium text-primary hover:underline"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-label-caps font-medium text-primary hover:underline"
            >
              Help Center
            </a>
          </nav>
        </footer>
      </main>
    </div>
  );
}
