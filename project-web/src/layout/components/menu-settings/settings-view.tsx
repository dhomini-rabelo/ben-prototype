import { useState } from "react";
import { useNavigate } from "react-router";
import Cookies from "js-cookie";
import { JWT_COOKIE, PROVIDER_COOKIE } from "@/api/client";
import { ROUTES } from "@/core/routes";
import { useAuthStore } from "@/layout/stores/auth-store";
import { SettingsSheet } from "./settings-sheet";

type SignOutState = "idle" | "pending" | "failed";

export function SettingsView() {
  const navigate = useNavigate();
  const user = useAuthStore((store) => store.user);
  const clear = useAuthStore((store) => store.clear);
  const [signOutState, setSignOutState] = useState<SignOutState>("idle");

  function handleSignOut() {
    setSignOutState("pending");
    try {
      Cookies.remove(JWT_COOKIE);
      Cookies.remove(PROVIDER_COOKIE);
      clear();
      navigate(ROUTES.login);
    } catch {
      setSignOutState("failed");
    }
  }

  return (
    <SettingsSheet
      variant={user ? "populated" : "error"}
      name={user?.name}
      email={user?.email}
      avatarUrl={user?.avatarUrl ?? undefined}
      signOutState={signOutState}
      onSignOut={handleSignOut}
      onRetry={handleSignOut}
    />
  );
}
