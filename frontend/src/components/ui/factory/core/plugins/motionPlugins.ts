import type { MotionPlugin } from "../primaryTypes";

export const motionPlugins: { base: MotionPlugin } = {
  base: () => ({
    rootClassName: "motion-reduce:transition-none",
  }),
};
