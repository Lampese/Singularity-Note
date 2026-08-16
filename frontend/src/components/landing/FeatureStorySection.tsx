"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LandingFeatureStory } from "./landingDemoData";
import styles from "./LandingPage.module.css";

interface FeatureStorySectionProps {
  story: LandingFeatureStory;
  children: ReactNode;
}

export function FeatureStorySection({ story, children }: FeatureStorySectionProps) {
  const stageOnLeft = story.alignment === "left";

  return (
    <article
      className={cn(
        styles.storySection,
        stageOnLeft ? styles.storySectionStageLeft : styles.storySectionStageRight,
      )}
    >
      <div className={styles.storyText}>
        {story.eyebrow ? (
          <div className={styles.storyEyebrow}>{story.eyebrow}</div>
        ) : null}
        <h3 className={styles.storyTitle}>{story.title}</h3>
        <p className={styles.storyBody}>{story.body}</p>
        <p className={styles.storyActionNote}>{story.actionNote}</p>
      </div>

      <div className={styles.storyStage}>{children}</div>
    </article>
  );
}
