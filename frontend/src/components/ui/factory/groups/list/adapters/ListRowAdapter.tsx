"use client";

import type React from "react";
import { FactoryListRow } from "../components";

export interface ListRowProps {
  leading?: React.ReactNode;
  label: React.ReactNode;
  meta?: React.ReactNode;
  trailingAction?: React.ReactNode;
  trailingSlotWidthPx?: number;
  className?: string;
  labelClassName?: string;
  onClick?: () => void;
  onDoubleClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  title?: string;
}

export function ListRow(props: ListRowProps) {
  return <FactoryListRow {...props} />;
}
