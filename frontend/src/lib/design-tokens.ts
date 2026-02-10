/**
 * PraxIA Design System Tokens
 * Premium, distinctive visual language
 */

export const colors = {
  praxia: {
    // Base colors: Pure blacks, cool grays, warm off-whites
    black: '#0a0a0a',
    charcoal: '#1e1e1e',
    gray: {
      800: '#2a2a2a',
      600: '#525252',
      400: '#94a3b8',
      200: '#e2e8f0',
      100: '#f1f5f9',
      50: '#f8fafc',
    },
    white: '#fafafa',

    // Primary accent: Amber (sophisticated, technical)
    accent: '#d97706',
    accentDark: '#b45309',
    accentLight: '#fbbf24',

    // Secondary: Teal (cold precision contrast)
    technical: '#0a9396',
    technicalLight: '#06b6d4',

    // Status colors
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
};

export const typography = {
  // Font families
  fontFamily: {
    sans: 'var(--font-space-grotesk), system-ui, -apple-system, sans-serif',
    mono: 'var(--font-jetbrains-mono), ui-monospace, monospace',
  },

  // Display (hero headlines)
  display: {
    size: '4.5rem', // 72px
    lineHeight: '1.05',
    letterSpacing: '-0.02em',
    fontWeight: '700',
  },

  // Headlines
  h1: {
    size: '3rem', // 48px
    lineHeight: '1.1',
    letterSpacing: '-0.01em',
    fontWeight: '700',
  },
  h2: {
    size: '2.25rem', // 36px
    lineHeight: '1.15',
    letterSpacing: '-0.01em',
    fontWeight: '600',
  },
  h3: {
    size: '1.875rem', // 30px
    lineHeight: '1.2',
    letterSpacing: '0',
    fontWeight: '600',
  },
  h4: {
    size: '1.5rem', // 24px
    lineHeight: '1.25',
    letterSpacing: '0',
    fontWeight: '600',
  },

  // Body text
  bodyLg: {
    size: '1.125rem', // 18px
    lineHeight: '1.6',
    fontWeight: '400',
  },
  body: {
    size: '1rem', // 16px
    lineHeight: '1.6',
    fontWeight: '400',
  },
  bodySm: {
    size: '0.875rem', // 14px
    lineHeight: '1.5',
    fontWeight: '400',
  },

  // Technical/monospace
  monoText: {
    size: '0.8125rem', // 13px
    lineHeight: '1.4',
    fontWeight: '400',
  },
};

export const spacing = {
  // Section spacing
  section: {
    sm: 'py-16 md:py-20',
    md: 'py-20 md:py-24',
    lg: 'py-24 md:py-32',
    xl: 'py-32 md:py-40',
  },

  // Container
  container: 'max-w-7xl mx-auto px-6 md:px-8',
  containerNarrow: 'max-w-5xl mx-auto px-6 md:px-8',
  containerWide: 'max-w-[1400px] mx-auto px-6 md:px-8',

  // Grid gaps
  gap: {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  },
};

export const borderRadius = {
  none: '0',
  sm: '0.25rem',  // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem',   // 8px
  xl: '0.75rem',  // 12px
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// Custom easing curves
export const easings = {
  easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
  easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  easeInOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',
  easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};
