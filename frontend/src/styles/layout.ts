import { cva } from "class-variance-authority";

export const layout = {
    // ── 全局容器 ──
    // 处理全屏、背景色和相对定位（用于放置 Toggle 按钮）
    root: cva("flex h-screen w-full overflow-hidden bg-bg relative isolate"),

    // ── 主内容区域 ──
    // 占据剩余空间，无多余背景层叠
    main: cva("flex-1 flex flex-col min-w-0 relative transition-all duration-300"),

    // ── 侧边栏容器 ──
    // 统一左右侧边栏的基础动画和层级
    sidebar: cva(
        "motion-transition-size flex flex-col bg-panel relative z-sidebar shrink-0 h-full overflow-hidden",
        {
            variants: {
                side: {
                    left: "",
                    right: "border-l border-border/50",
                },
                collapsed: {
                    true: "w-0 min-w-0 border-none pointer-events-none overflow-hidden",
                    false: "", // 宽度由 style 或具体 className 控制
                },
            },
            defaultVariants: {
                side: "left",
                collapsed: false,
            },
        }
    ),
    overlaySidebar: cva(
        "frosted-surface-subtle absolute inset-y-0 left-0 z-sidebar flex h-full flex-col overflow-hidden transition-transform duration-300 [transition-timing-function:var(--motion-ease-standard)] will-change-transform",
        {
            variants: {
                collapsed: {
                    true: "-translate-x-full pointer-events-none",
                    false: "translate-x-0",
                },
            },
            defaultVariants: {
                collapsed: false,
            },
        }
    ),

    // ── 侧边栏列表项 (修复间距和按钮样式问题的关键) ──
    sidebarItem: cva(
        "group flex items-center gap-2.5 px-3 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer select-none border border-transparent",
        {
            variants: {
                active: {
                    true: "bg-accent/10 text-accent border-accent/10",
                    false: "text-text-secondary hover:bg-surface-hover hover:text-text hover:border-border/50",
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

    // ── 侧边栏分段标题 ──
    sidebarHeader: cva("flex items-center justify-between px-4 py-3 shrink-0"),
    sidebarTitle: cva("text-sm font-semibold text-text-muted uppercase tracking-wider"),

    // ── 主区顶部控件轨道（自然排版对齐） ──
    topbarRail: cva(
        "absolute top-[var(--workspace-topbar-control-offset-y)] left-[var(--workspace-topbar-inset-x)] z-50 flex items-center gap-[var(--gap-surface-stack)] pointer-events-none"
    ),
    topbarControl: cva(
        "group pointer-events-auto inline-flex items-center justify-center bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
    ),

    // ── 模态框 (Modal) ──
    modal: {
        overlay: cva("fixed inset-0 z-modal bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"),
        content: cva("frosted-surface-prominent rounded-[28px] w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[85vh]"),
        header: cva("flex justify-between items-center px-6 py-4 border-b border-border/40 sticky top-0 z-10"),
        body: cva("p-6 overflow-y-auto custom-scrollbar"),
        footer: cva("flex justify-end px-6 py-4 border-t border-border/40"),
    },
};
