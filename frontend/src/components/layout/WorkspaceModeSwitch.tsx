"use client";

import Link from "next/link";
import {
  ChatCircleDotsIcon,
  CardsIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type WorkspaceMode = "chat" | "cards";

interface WorkspaceModeSwitchProps {
  workspaceId: string;
  activeMode: WorkspaceMode;
  chatHref?: string;
  cardsHref?: string;
  onModeChange?: (mode: WorkspaceMode, href: string) => void;
}

const modes = [
  {
    id: "chat" as const,
    label: "对话",
    icon: ChatCircleDotsIcon,
  },
  {
    id: "cards" as const,
    label: "记忆卡",
    icon: CardsIcon,
  },
];

export function WorkspaceModeSwitch({
  workspaceId,
  activeMode,
  chatHref,
  cardsHref,
  onModeChange,
}: WorkspaceModeSwitchProps) {
  return (
    <div className="pointer-events-auto workspace-utility-island rounded-full p-1.5">
      <nav className="flex items-center gap-1" aria-label="工作区模式切换">
        {modes.map((mode) => {
          const href = mode.id === "cards"
            ? (cardsHref ?? `/workspaces/${workspaceId}/cards`)
            : (chatHref ?? `/workspaces/${workspaceId}`);
          const active = mode.id === activeMode;
          const Icon = mode.icon;

          return (
            <Link
              key={mode.id}
              href={href}
              onClick={(event) => {
                if (
                  active ||
                  event.defaultPrevented ||
                  event.button !== 0 ||
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                ) {
                  return;
                }

                if (!onModeChange) {
                  return;
                }

                event.preventDefault();
                onModeChange(mode.id, href);
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium tracking-tight transition-colors",
                active
                  ? "workspace-utility-island-subtle text-text"
                  : "text-text-muted hover:bg-surface-hover hover:text-text",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={16} weight={active ? "fill" : "regular"} />
              <span>{mode.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
