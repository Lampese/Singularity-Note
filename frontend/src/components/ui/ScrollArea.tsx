import * as React from "react"
import { cn } from "@/lib/utils"

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: "vertical" | "horizontal" | "both"
    autoHideScrollbar?: boolean
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
    ({ className, children, orientation = "vertical", autoHideScrollbar = false, ...props }, ref) => {
        const innerRef = React.useRef<HTMLDivElement | null>(null);
        const [scrolling, setScrolling] = React.useState(false);
        const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

        const setRef = React.useCallback(
            (node: HTMLDivElement | null) => {
                innerRef.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            },
            [ref],
        );

        React.useEffect(() => {
            if (!autoHideScrollbar) return;
            const el = innerRef.current;
            if (!el) return;

            const onScroll = () => {
                setScrolling(true);
                if (timerRef.current) clearTimeout(timerRef.current);
                timerRef.current = setTimeout(() => setScrolling(false), 800);
            };

            el.addEventListener("scroll", onScroll, { passive: true });
            return () => {
                el.removeEventListener("scroll", onScroll);
                if (timerRef.current) clearTimeout(timerRef.current);
            };
        }, [autoHideScrollbar]);

        return (
            <div
                ref={setRef}
                className={cn(
                    "relative",
                    orientation === "vertical" && "overflow-y-auto overflow-x-hidden",
                    orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
                    orientation === "both" && "overflow-auto",
                    autoHideScrollbar && "scrollbar-autohide",
                    autoHideScrollbar && scrolling && "is-scrolling",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
