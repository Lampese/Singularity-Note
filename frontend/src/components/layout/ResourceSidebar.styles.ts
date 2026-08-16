import { cva } from "class-variance-authority";

export const resourceSidebarStyles = {
    // Top-level container
    root: cva("flex flex-col h-full"),

    // Header section
    header: {
        container: cva("relative flex h-[var(--workspace-topbar-height)] shrink-0 items-center justify-center border-b border-border/50"),
        workspaceButton: cva("flex max-w-[calc(100%-40px)] cursor-pointer select-none items-center justify-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-semibold text-text bg-transparent transition-colors [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] hover:bg-surface-hover active:bg-surface-active motion-reduce:transition-none tracking-tight"),
        title: cva("flex-1 text-center text-text font-semibold select-none tracking-tight"),
        collapseButton: cva("group absolute right-2 shrink-0 inline-flex h-[var(--workspace-topbar-control-size)] w-[var(--workspace-topbar-control-size)] items-center justify-center bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"),
    },

    sections: {
        stack: cva("flex flex-col gap-2 px-1.5 py-2"),
    },

    // Resource list section
    section: {
        block: cva("flex flex-col gap-2", {
            variants: {
                divided: {
                    true: "border-t border-border/30 pt-2",
                    false: "",
                },
            },
            defaultVariants: {
                divided: false,
            },
        }),
        container: cva("flex min-w-0 items-center gap-2 pt-5 pb-1.5 shrink-0"),
        title: cva("min-w-0 truncate whitespace-nowrap text-xs font-medium uppercase tracking-widest text-text-muted/70"),
        headingLabel: cva(
            "inline-flex min-w-0 flex-1 items-center justify-start gap-2 overflow-hidden px-1 py-1 text-text-muted"
        ),
        headingButton: cva(
            "group inline-flex min-w-0 flex-1 items-center justify-start gap-2 overflow-hidden rounded-[var(--radius-button)] px-1 py-1 text-text-muted bg-transparent transition-colors [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 motion-reduce:transition-none"
        ),
        actions: cva("flex min-w-0 shrink-0 items-center gap-2"),
        content: cva("flex flex-col gap-1"),
        actionButton: cva(
            "flex items-center justify-center gap-1.5 px-2 py-1 rounded-[var(--radius-button)] text-xs font-semibold transition-all whitespace-nowrap shrink-0",
            {
                variants: {
                    variant: {
                        primary: "bg-accent/10 text-accent hover:bg-accent/20",
                        active: "bg-accent text-text-inverse hover:bg-accent/90",
                        outline: "bg-transparent border border-border hover:bg-surface-hover text-text-secondary hover:text-text",
                    }
                },
                defaultVariants: {
                    variant: "primary"
                }
            }
        ),
        actionPill: cva(
            "max-w-full border-0 bg-accent/10 text-xs font-medium text-accent transition-colors [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] hover:bg-accent/20 active:bg-accent/25 motion-reduce:transition-none"
        ),
    },

    // Selection bar
    selectionBar: {
        container: cva("mb-2 flex items-center justify-between rounded-md bg-error/10 px-[var(--sidebar-item-content-inset-x)] py-2 animate-in zoom-in-95 shrink-0"),
        text: cva("text-xs text-error font-medium whitespace-nowrap"),
        button: cva("flex items-center justify-center text-xs bg-error/10 text-error px-2 py-1 rounded-[var(--radius-button)] hover:bg-error/20 transition-colors whitespace-nowrap font-medium shrink-0 disabled:opacity-50 disabled:cursor-not-allowed")
    },

    // Individual Resource Item
    item: cva(
        "group flex min-w-0 cursor-pointer select-none items-center gap-[var(--sidebar-slot-min-gap-x)] rounded-xl px-[var(--sidebar-item-content-inset-x)] py-2 text-sm transition-all [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
        {
            variants: {
                active: {
                    true: "bg-accent/10 text-accent font-semibold",
                    false: "font-medium text-text-secondary hover:bg-surface-hover hover:text-text",
                },
                isDragging: {
                    true: "opacity-50 scale-95",
                    false: "",
                },
            },
            defaultVariants: {
                active: false,
                isDragging: false,
            },
        }
    ),
    // Checkbox for selection mode
    checkbox: cva(
        "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
        {
            variants: {
                checked: {
                    true: "bg-accent border-accent text-text-inverse",
                    false: "border-text-secondary bg-panel"
                }
            },
            defaultVariants: {
                checked: false
            }
        }
    ),

    // Footer user profile
    footer: {
        container: cva("relative mt-auto flex flex-col gap-2 border-t border-border/40 bg-panel/60 p-3 shrink-0"),
        profile: cva("group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] hover:bg-surface-hover motion-reduce:transition-none"),
        avatar: cva("h-8 w-8 shrink-0 rounded-full bg-accent text-xs font-semibold text-text-inverse transition-transform [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] group-hover:scale-105 motion-reduce:transition-none flex items-center justify-center"),
        info: cva("flex flex-col overflow-hidden min-w-0"),
        name: cva("text-sm font-medium text-text truncate"),
    }
};
