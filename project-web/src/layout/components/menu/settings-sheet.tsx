import { LogOut, RotateCw, User } from "lucide-react";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";
import { MenuSheet } from "./menu-sheet";

type SettingsSheetProps = {
  variant?: "populated" | "loading" | "error";
  name?: string;
  email?: string;
  avatarUrl?: string;
  signOutState?: "idle" | "pending" | "failed";
  className?: string;
  onSignOut?: () => void;
  onRetry?: () => void;
};

export function SettingsSheet({
  variant = "populated",
  name,
  email,
  avatarUrl,
  signOutState = "idle",
  className,
  onSignOut,
  onRetry,
}: SettingsSheetProps) {
  return (
    <MenuSheet className={className}>
      <div className="flex items-center justify-between px-5 pt-1 pb-3">
        <Typography variant="label-caps" className="text-on-surface-variant">
          Settings
        </Typography>
      </div>

      <div className="flex items-center gap-3 px-5 pt-1 pb-5">
        {variant === "loading" ? (
          <>
            <div className="size-12 animate-pulse rounded-full bg-outline-variant/40" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-32 animate-pulse rounded bg-outline-variant/40" />
              <div className="h-3 w-44 animate-pulse rounded bg-outline-variant/30" />
            </div>
          </>
        ) : (
          <>
            <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container-high text-on-surface-variant">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                <User className="size-5" strokeWidth={1.75} />
              )}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              {variant === "populated" && name && (
                <Typography
                  variant="body-md"
                  className="truncate font-semibold text-on-surface"
                >
                  {name}
                </Typography>
              )}
              {email && (
                <Typography
                  variant="label-caps"
                  className="truncate normal-case text-on-surface-variant"
                >
                  {email}
                </Typography>
              )}
              {variant === "error" && (
                <Typography
                  variant="label-caps"
                  className="normal-case text-on-surface-variant/70"
                >
                  couldn't load full profile
                </Typography>
              )}
            </div>
          </>
        )}
      </div>

      <div className="px-5">
        <button
          type="button"
          disabled={signOutState === "pending"}
          onClick={onSignOut}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3 text-left transition-colors hover:bg-surface-container",
            signOutState === "pending" && "opacity-60",
          )}
        >
          <Typography
            variant="body-md"
            className="font-semibold text-on-surface"
          >
            {signOutState === "pending" ? "signing out…" : "Sign out"}
          </Typography>
          <LogOut
            className="size-4 text-on-surface-variant"
            strokeWidth={1.75}
          />
        </button>

        {signOutState === "failed" && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-2.5">
            <Typography variant="body-md" className="text-text-error">
              didn't sign you out — try again?
            </Typography>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 text-label-caps font-mono uppercase text-text-error"
            >
              <RotateCw className="size-3" /> retry
            </button>
          </div>
        )}
      </div>
    </MenuSheet>
  );
}
