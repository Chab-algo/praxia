import { Variants } from "framer-motion";

export const motionDurations = {
  fast: 0.12,
  base: 0.2,
  slow: 0.32,
};

export const motionEase: Record<
  "easeOut" | "easeIn" | "easeInOut",
  [number, number, number, number]
> = {
  easeOut: [0.16, 1, 0.3, 1],
  easeIn: [0.7, 0, 0.84, 0],
  easeInOut: [0.4, 0, 0.2, 1],
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDurations.base, ease: motionEase.easeOut },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: motionDurations.base, ease: motionEase.easeIn },
  },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: motionDurations.base, ease: motionEase.easeOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: motionDurations.base, ease: motionEase.easeIn },
  },
};

export const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.04 },
  },
};

export const cardHover = {
  whileHover: { y: -2, scale: 1.01 },
  whileTap: { scale: 0.99 },
};

export const expandCollapse: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: "auto",
    opacity: 1,
    transition: { duration: motionDurations.base, ease: motionEase.easeInOut },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: motionDurations.base, ease: motionEase.easeInOut },
  },
};
