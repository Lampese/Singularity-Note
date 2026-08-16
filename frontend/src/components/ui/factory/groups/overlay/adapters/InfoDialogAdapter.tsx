"use client";

import { InfoPattern } from "../components";

export type InfoDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  details?: string;
  closeText?: string;
  actionText?: string;
  onClose: () => void;
  onAction?: () => void;
};

export function InfoDialog(props: InfoDialogProps) {
  return <InfoPattern {...props} />;
}
