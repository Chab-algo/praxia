import { Variants, Transition, MotionValue } from "framer-motion";

/**
 * PRAXIA PREMIUM MOTION SYSTEM
 * Exploite Motion 2026 features: layout animations, independent transforms,
 * spring physics, scroll-triggered animations
 */

// ============================================================================
// PHYSICS & TIMING
// ============================================================================

export const springs = {
  // Bouncy, playful
  bouncy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 17,
  },
  // Smooth, professional
  smooth: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  },
  // Gentle, subtle
  gentle: {
    type: "spring" as const,
    stiffness: 200,
    damping: 25,
  },
  // Snappy, responsive
  snappy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 25,
  },
};

export const durations = {
  instant: 0.1,
  fast: 0.2,
  base: 0.3,
  slow: 0.5,
  slower: 0.8,
};

export const easings = {
  // Premium easings pour feel haut de gamme
  easeOutExpo: [0.19, 1, 0.22, 1] as const,
  easeInOutExpo: [0.87, 0, 0.13, 1] as const,
  easeOutCirc: [0, 0.55, 0.45, 1] as const,
  easeInOutCirc: [0.85, 0, 0.15, 1] as const,
  // Motion Design standard
  easeOut: [0.16, 1, 0.3, 1] as const,
  easeIn: [0.7, 0, 0.84, 0] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
};

// ============================================================================
// ENTRANCE ANIMATIONS
// ============================================================================

export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 24,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: durations.base,
      ease: easings.easeOutExpo,
    },
  },
  exit: {
    opacity: 0,
    y: -16,
    filter: "blur(4px)",
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

export const fadeInDown: Variants = {
  initial: {
    opacity: 0,
    y: -24,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: durations.base,
      ease: easings.easeOutExpo,
    },
  },
};

export const fadeInScale: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    filter: "blur(6px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: springs.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(4px)",
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

export const slideInFromRight: Variants = {
  initial: {
    opacity: 0,
    x: 40,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: springs.smooth,
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

export const slideInFromLeft: Variants = {
  initial: {
    opacity: 0,
    x: -40,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: springs.smooth,
  },
};

// ============================================================================
// STAGGER ANIMATIONS
// ============================================================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

export const staggerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// ============================================================================
// INTERACTIVE ANIMATIONS (Hover, Tap, Drag)
// ============================================================================

export const cardHoverPremium = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: springs.smooth,
  },
  tap: {
    scale: 0.98,
    transition: springs.snappy,
  },
};

export const buttonHoverPremium = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: springs.bouncy,
  },
  tap: {
    scale: 0.95,
    transition: springs.snappy,
  },
};

export const glowHover = {
  rest: {
    boxShadow: "0 0 0 rgba(59, 130, 246, 0)",
  },
  hover: {
    boxShadow: "0 0 24px rgba(59, 130, 246, 0.4)",
    transition: {
      duration: durations.base,
      ease: easings.easeOut,
    },
  },
};

export const liftHover = {
  rest: {
    y: 0,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    y: -8,
    boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
    transition: springs.smooth,
  },
  tap: {
    y: -2,
    transition: springs.snappy,
  },
};

// ============================================================================
// LAYOUT ANIMATIONS (FLIP technique automatique)
// ============================================================================

export const layoutTransition: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 30,
};

export const layoutTransitionSmooth: Transition = {
  type: "spring",
  stiffness: 250,
  damping: 35,
};

// ============================================================================
// EXPAND/COLLAPSE ANIMATIONS
// ============================================================================

export const expandCollapse: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: durations.fast,
        ease: easings.easeInOut,
      },
      opacity: {
        duration: durations.fast * 0.8,
        ease: easings.easeIn,
      },
    },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: {
        duration: durations.base,
        ease: easings.easeOutExpo,
      },
      opacity: {
        duration: durations.base,
        ease: easings.easeOut,
        delay: 0.05,
      },
    },
  },
};

export const accordionItem: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: "hidden",
  },
  expanded: {
    height: "auto",
    opacity: 1,
    overflow: "visible",
    transition: springs.smooth,
  },
};

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.base,
      ease: easings.easeOutExpo,
      when: "beforeChildren",
      staggerChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: durations.fast,
      ease: easings.easeInOut,
    },
  },
};

export const pageSlideTransition: Variants = {
  initial: {
    x: 100,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: springs.smooth,
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

// ============================================================================
// SCROLL-TRIGGERED ANIMATIONS
// ============================================================================

export const revealOnScroll: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: durations.slow,
      ease: easings.easeOutExpo,
    },
  },
};

export const parallaxItem = {
  y: [0, -50], // Will be controlled by scroll progress
  transition: {
    ease: "linear",
  },
};

// ============================================================================
// LOADING & SKELETON ANIMATIONS
// ============================================================================

export const shimmer: Variants = {
  initial: {
    backgroundPosition: "-200% 0",
  },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      duration: 2,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

export const pulse: Variants = {
  initial: {
    opacity: 1,
  },
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

// ============================================================================
// NOTIFICATION & TOAST ANIMATIONS
// ============================================================================

export const toastSlideIn: Variants = {
  initial: {
    x: 400,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: springs.bouncy,
  },
  exit: {
    x: 400,
    opacity: 0,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

export const notificationBounce: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: [0, 1.1, 1],
    opacity: 1,
    transition: {
      duration: durations.base,
      ease: easings.easeOutCirc,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

// ============================================================================
// SUCCESS & ERROR STATES
// ============================================================================

export const successPulse: Variants = {
  initial: {
    scale: 1,
  },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      ease: easings.easeOutCirc,
    },
  },
};

export const errorShake: Variants = {
  initial: {
    x: 0,
  },
  animate: {
    x: [-10, 10, -8, 8, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: "linear",
    },
  },
};

// ============================================================================
// GLASS MORPHISM HOVER
// ============================================================================

export const glassMorphHover = {
  rest: {
    backdropFilter: "blur(12px)",
  },
  hover: {
    backdropFilter: "blur(20px)",
    transition: {
      duration: durations.base,
      ease: easings.easeOut,
    },
  },
};

// ============================================================================
// HELPER: Scroll-based transform
// ============================================================================

export const createScrollTransform = (
  scrollY: MotionValue<number>,
  inputRange: number[],
  outputRange: number[]
) => {
  // Utilisé avec useTransform de Motion pour parallax/scroll effects
  return { inputRange, outputRange };
};

// ============================================================================
// PRESET COMBINATIONS
// ============================================================================

export const premiumCard = {
  variants: fadeInScale,
  whileHover: "hover",
  whileTap: "tap",
  layout: true,
  layoutId: undefined, // Set dynamically per card
  transition: layoutTransition,
};

export const premiumButton = {
  variants: fadeInUp,
  whileHover: buttonHoverPremium.hover,
  whileTap: buttonHoverPremium.tap,
};

export const premiumListItem = {
  variants: fadeInUp,
  layout: true,
  transition: layoutTransitionSmooth,
};
