export type SendShortcutPreference = "enter" | "meta_enter";

export const DEFAULT_SEND_SHORTCUT: SendShortcutPreference = "enter";

export const SEND_SHORTCUT_LABELS: Record<SendShortcutPreference, string> = {
  enter: "Enter 发送",
  meta_enter: "Cmd/Ctrl + Enter 发送",
};

export function normalizeSendShortcutPreference(
  value: unknown,
): SendShortcutPreference {
  return value === "meta_enter" ? "meta_enter" : DEFAULT_SEND_SHORTCUT;
}

export function getComposerPlaceholder(
  sendShortcut: SendShortcutPreference,
): string {
  if (sendShortcut === "meta_enter") {
    return "输入消息，Enter 换行，Cmd/Ctrl + Enter 发送";
  }

  return "输入消息，Enter 发送，Shift + Enter 换行";
}

export function getComposerShortcutHint(
  sendShortcut: SendShortcutPreference,
): string {
  return SEND_SHORTCUT_LABELS[sendShortcut];
}
