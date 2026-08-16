const WORKSPACE_TOUR_VERSION = "v2";
const WORKSPACE_TOUR_ARMED_KEY = `sn_workspace_tour_${WORKSPACE_TOUR_VERSION}_armed`;
const WORKSPACE_TOUR_COMPLETED_KEY = `sn_workspace_tour_${WORKSPACE_TOUR_VERSION}_completed`;

export const WORKSPACE_TOUR_TARGETS = {
  workspaceSwitcher: '[data-tour-id="workspace-switcher"]',
  uploadButton: '[data-tour-id="workspace-upload"]',
  newConversationButton: '[data-tour-id="new-conversation"]',
  accountMenuTrigger: '[data-tour-id="workspace-account-menu"]',
  chatComposer: '[data-tour-id="chat-composer"]',
  searchRequiredToggle: '[data-tour-id="search-required-toggle"]',
  attachmentButton: '[data-tour-id="chat-attachment-button"]',
} as const;

export const WORKSPACE_TOUR_SELECTORS = Object.values(WORKSPACE_TOUR_TARGETS);

function readFlag(storageKey: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(storageKey) === "1";
  } catch (error) {
    console.warn(`Failed to read localStorage key ${storageKey}`, error);
    return false;
  }
}

function writeFlag(storageKey: string, enabled: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, enabled ? "1" : "0");
  } catch (error) {
    console.warn(`Failed to write localStorage key ${storageKey}`, error);
  }
}

export function armWorkspaceTour(): void {
  writeFlag(WORKSPACE_TOUR_ARMED_KEY, true);
}

export function isWorkspaceTourArmed(): boolean {
  return readFlag(WORKSPACE_TOUR_ARMED_KEY);
}

export function markWorkspaceTourCompleted(): void {
  writeFlag(WORKSPACE_TOUR_COMPLETED_KEY, true);
}

export function hasCompletedWorkspaceTour(): boolean {
  return readFlag(WORKSPACE_TOUR_COMPLETED_KEY);
}
