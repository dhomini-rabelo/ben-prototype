import type { ComponentType } from "react";

export type CaptureKind = "note" | "reminder" | "task";
export type TaskShape = "text" | "list";
export type CaptureCardState =
  | "default"
  | "pending"
  | "error"
  | "active"
  | "finished"
  | "fired";

export type CaptureCardIcon = ComponentType<{
  className?: string;
  strokeWidth?: number;
}>;

export type CaptureCardProps = {
  kind: CaptureKind;
  title: string;
  meta?: string;
  state?: CaptureCardState;
  taskShape?: TaskShape;
  actionLabel?: string;
  supportingText?: string;
  onAction?: () => void;
  errorMessage?: string;
  className?: string;
};
