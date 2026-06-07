import { BrandMark } from "@/layout/components/brand-mark";
import { GoogleIcon } from "@/layout/components/icons/google-icon";
import { Button } from "@/layout/components/ui/button";
import { Typography } from "@/layout/components/ui/typography";
import { useGoogleAuth } from "@/layout/hooks/use-google-auth";

export function Login() {
  const { signIn, isLoading, isExtendedWait, isPermissionDenied, error } =
    useGoogleAuth();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-on-background">
      <main className="flex w-full max-w-[320px] flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <BrandMark orientation="column" itemClassName="fade-in-up" />
          <Typography
            variant="tagline"
            className="fade-in-up delay-100 max-w-[280px] text-secondary"
          >
            your busy-day brain — say it, Ben files it
          </Typography>
        </div>

        <div className="fade-in-up delay-200 flex w-full flex-col gap-3">
          {isPermissionDenied && (
            <div
              role="status"
              className="fade-in-up w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-left text-body-md text-on-surface-variant"
            >
              looks like that didn't go through — want to try again?
            </div>
          )}
          {error && (
            <Typography variant="body-md" className="text-error text-center">
              {error}
            </Typography>
          )}
          <Button className="w-full" onClick={signIn} disabled={isLoading}>
            <GoogleIcon className="size-5 opacity-90 transition-opacity group-hover:opacity-100" />
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>
          {isExtendedWait && (
            <Typography
              variant="body-md"
              className="fade-in-up delay-200 text-secondary"
            >
              still waiting on Google…
            </Typography>
          )}
        </div>

        <footer className="fade-in-up delay-200 flex flex-col items-center gap-2 pt-2">
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
