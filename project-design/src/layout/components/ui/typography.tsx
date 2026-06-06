import type { ElementType, ReactNode } from "react";
import { cn } from "@/layout/utils/cn";

export type TypographyVariant =
  | "wordmark"
  | "tagline"
  | "headline-lg"
  | "body-md"
  | "button-text"
  | "label-caps";

const variantClasses: Record<TypographyVariant, string> = {
  wordmark: "text-wordmark",
  tagline: "text-tagline",
  "headline-lg": "text-headline-lg",
  "body-md": "text-body-md",
  "button-text": "text-button",
  "label-caps": "text-label-caps font-mono uppercase",
};

const defaultElement: Record<TypographyVariant, ElementType> = {
  wordmark: "h1",
  tagline: "p",
  "headline-lg": "h2",
  "body-md": "p",
  "button-text": "span",
  "label-caps": "span",
};

type TypographyProps = {
  variant: TypographyVariant;
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

export function Typography({
  variant,
  as,
  className,
  children,
}: TypographyProps) {
  const Component = as ?? defaultElement[variant];
  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  );
}
