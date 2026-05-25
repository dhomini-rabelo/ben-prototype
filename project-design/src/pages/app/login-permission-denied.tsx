import { GoogleIcon } from "../../layout/components/icons/google-icon";
import { BrandMark } from "../../layout/components/ui/brand-mark";
import { Button } from "../../layout/components/ui/button";
import { Typography } from "../../layout/components/ui/typography";

export function LoginPermissionDenied() {
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
        <div className="flex w-full flex-col gap-3">
          <div
            role="status"
            className="fade-in-up w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-left text-body-md text-on-surface-variant"
          >
            looks like that didn't go through — want to try again?
          </div>
          <Button className="w-full">
            <GoogleIcon className="size-5 opacity-90 transition-opacity group-hover:opacity-100" />
            Continue with Google
          </Button>
        </div>
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
