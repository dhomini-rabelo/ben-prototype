import { BenLogo } from "../../layout/components/icons/ben-logo";
import { GoogleIcon } from "../../layout/components/icons/google-icon";
import { Button } from "../../layout/components/ui/button";
import { Typography } from "../../layout/components/ui/typography";

export function LoginEmpty() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-on-background">
      <main className="flex w-full max-w-[320px] flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <BenLogo className="fade-in-up text-primary" />
          <Typography variant="wordmark" className="fade-in-up text-primary">
            Ben
          </Typography>
          <Typography
            variant="tagline"
            className="fade-in-up delay-100 max-w-[280px] text-secondary"
          >
            your busy-day brain — say it, Ben files it
          </Typography>
        </div>
        <Button className="fade-in-up delay-200 w-full">
          <GoogleIcon className="size-5 opacity-90 transition-opacity group-hover:opacity-100" />
          Continue with Google
        </Button>
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
