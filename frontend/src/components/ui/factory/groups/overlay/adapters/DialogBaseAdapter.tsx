"use client";

import { DialogShell } from "../components";

export type DialogBaseProps = {
  open: boolean;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  panelContent?: React.ReactNode;
  onClose: () => void;
  overlayClassName?: string;
  panelClassName?: string;
  panelStyle?: React.CSSProperties;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  hideCloseButton?: boolean;
  placement?: "center" | "right";
};

export function DialogBase(props: DialogBaseProps) {
  return <DialogShell {...props} />;
}
