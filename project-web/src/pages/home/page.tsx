import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { ROUTES } from "../../core/routes";
import { BrandMark } from "../../layout/components/brand-mark";
import { Typography } from "../../layout/components/ui/typography";

export function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Cookies.get("@ben/jwttoken")) {
      navigate(ROUTES.login);
    }
  }, [navigate]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-on-background">
      <main className="flex w-full max-w-[320px] flex-col items-center gap-8 text-center">
        <BrandMark orientation="column" />
        <Typography variant="tagline" className="text-secondary">
          You're signed in. Ben is ready.
        </Typography>
      </main>
    </div>
  );
}
