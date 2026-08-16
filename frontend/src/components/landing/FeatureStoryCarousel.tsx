"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { LandingFeatureDemo } from "./LandingFeatureDemos";
import { FeatureStorySection } from "./FeatureStorySection";
import type { LandingFeatureStory } from "./landingDemoData";

const AUTO_PLAY_INTERVAL = 6000;

interface FeatureStoryCarouselProps {
  stories: LandingFeatureStory[];
}

export function FeatureStoryCarousel({ stories }: FeatureStoryCarouselProps) {
  const len = stories.length;
  // slides = [clone-last, ...stories, clone-first]
  // trackIndex 1..len are the real slides, 0 and len+1 are clones
  const [trackIndex, setTrackIndex] = useState(1);
  const [animated, setAnimated] = useState(true);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const jumpingRef = useRef(false);

  // Pause auto-play when the tab is hidden so trackIndex doesn't drift
  useEffect(() => {
    const handler = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  // The real story index (0-based)
  const realIndex = ((trackIndex - 1) % len + len) % len;

  const goTo = useCallback((nextTrack: number) => {
    setAnimated(true);
    setTrackIndex(nextTrack);
  }, []);

  // Instantly jump from a clone position to the corresponding real slide.
  // Called both from onTransitionEnd and as a fallback when transitions don't fire.
  const jumpFromClone = useCallback(() => {
    if (trackIndex === 0) {
      jumpingRef.current = true;
      setAnimated(false);
      setTrackIndex(len);
    } else if (trackIndex === len + 1) {
      jumpingRef.current = true;
      setAnimated(false);
      setTrackIndex(1);
    }
  }, [trackIndex, len]);

  // After transition on a clone, instantly jump to the real one
  const handleTransitionEnd = useCallback(() => {
    jumpFromClone();
  }, [jumpFromClone]);

  // Fallback: if we're sitting on a clone and the transition never fired
  // (tab hidden, reduced motion, etc.), jump synchronously.
  useEffect(() => {
    if (trackIndex === 0 || trackIndex === len + 1) {
      const id = setTimeout(() => jumpFromClone(), 600);
      return () => clearTimeout(id);
    }
  }, [trackIndex, len, jumpFromClone]);

  // Re-enable animation after a non-animated jump
  useEffect(() => {
    if (!animated && jumpingRef.current) {
      jumpingRef.current = false;
      // Force a reflow then re-enable
      requestAnimationFrame(() => setAnimated(true));
    }
  }, [animated]);

  // Auto-play — pauses when hovered or tab is hidden
  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    if (paused || hidden) return;
    // Don't advance if we're sitting on a clone (waiting for jump)
    if (trackIndex === 0 || trackIndex === len + 1) return;
    timerRef.current = setTimeout(() => {
      goTo(trackIndex + 1);
    }, AUTO_PLAY_INTERVAL);
  }, [trackIndex, paused, hidden, goTo, len]);

  useEffect(() => {
    resetTimer();
    return () => clearTimeout(timerRef.current);
  }, [trackIndex, resetTimer]);

  // Build the extended slide array: [clone-last, ...stories, clone-first]
  const slides = [stories[len - 1], ...stories, stories[0]];

  return (
    <div
      className="grid gap-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Track */}
      <div
        className="relative overflow-x-clip"
        style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
      >
        <div
          className={cn(
            "flex gap-4",
            animated && "transition-transform duration-500 motion-reduce:transition-none",
          )}
          style={{
            transform: `translateX(calc(20vw - ${trackIndex} * (60vw + 16px)))`,
            transitionTimingFunction: animated ? "cubic-bezier(0.4, 0, 0.2, 1)" : undefined,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((story, i) => {
            const isActive = i === trackIndex;

            return (
              <div
                // clones share id with real slides, use index as key
                key={`${story.id}-${i}`}
                className={cn(
                  "shrink-0",
                  animated && "transition-all duration-500 motion-reduce:transition-none",
                )}
                style={{
                  width: "60vw",
                  opacity: isActive ? 1 : 0.35,
                  transform: isActive ? "scale(1)" : "scale(0.88)",
                  filter: isActive ? "none" : "blur(1.5px)",
                  transitionTimingFunction: animated ? "cubic-bezier(0.4, 0, 0.2, 1)" : undefined,
                }}
              >
                <div
                  className={cn("relative", !isActive && "cursor-pointer")}
                  onClick={
                    !isActive
                      ? () => {
                          // figure out direction
                          const diff = i - trackIndex;
                          goTo(trackIndex + diff);
                        }
                      : undefined
                  }
                  role={!isActive ? "button" : undefined}
                  tabIndex={!isActive ? 0 : undefined}
                  onKeyDown={
                    !isActive
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            goTo(trackIndex + (i - trackIndex));
                          }
                        }
                      : undefined
                  }
                >
                  {!isActive && (
                    <div className="pointer-events-none absolute inset-0 z-10 rounded-[36px] bg-white/30" />
                  )}
                  <FeatureStorySection story={story}>
                    <LandingFeatureDemo story={story} />
                  </FeatureStorySection>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2">
        {stories.map((story, index) => (
          <button
            key={story.id}
            type="button"
            onClick={() => {
              // Pick the shortest direction, using clones if wrapping is shorter
              const forwardDist = ((index - realIndex) % len + len) % len;
              const backwardDist = len - forwardDist;
              if (forwardDist <= backwardDist) {
                goTo(trackIndex + forwardDist);
              } else {
                goTo(trackIndex - backwardDist);
              }
            }}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === realIndex
                ? "w-6 bg-[var(--accent-strong)]"
                : "w-2 bg-[rgba(208,215,222,0.6)] hover:bg-[rgba(208,215,222,0.9)]",
            )}
            aria-label={story.title}
          />
        ))}
      </div>
    </div>
  );
}
