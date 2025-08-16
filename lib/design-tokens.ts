/**
 * Design Tokens for Cyberpunk HUD Interface
 * This file contains all the design system tokens for consistent styling
 */

// Color Palette
export const colors = {
  // Primary Cyberpunk Colors
  cyber: {
    bg: '#0a0a1a',
    surface: 'rgba(20, 20, 40, 0.5)',
    border: 'rgba(0, 255, 255, 0.2)',
    cyan: '#00ffff',
    purple: '#a855f7',
    orange: '#f97316',
    glow: 'rgba(0, 255, 255, 0.5)',
  },
  
  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  
  // Semantic Colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  
  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
} as const

// Typography Scale
export const typography = {
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
    roboto: ['Roboto', 'sans-serif'],
    lora: ['Lora', 'serif'],
    poppins: ['Poppins', 'sans-serif'],
    oswald: ['Oswald', 'sans-serif'],
    montserrat: ['Montserrat', 'sans-serif'],
    lobster: ['Lobster', 'cursive'],
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
    '8xl': '6rem',     // 96px
    '9xl': '8rem',     // 128px
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const

// Spacing Scale
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
} as const

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const

// Shadows
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  
  // Cyberpunk Glow Effects
  glow: {
    cyan: '0 0 15px rgba(0, 255, 255, 0.6), 0 0 5px rgba(0, 255, 255, 0.8)',
    purple: '0 0 15px rgba(168, 85, 247, 0.6), 0 0 5px rgba(168, 85, 247, 0.8)',
    orange: '0 0 15px rgba(249, 115, 22, 0.6), 0 0 5px rgba(249, 115, 22, 0.8)',
  },
} as const

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const

// Breakpoints
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Animation Durations
export const animation = {
  duration: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },
  
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

// Component Sizes
export const sizes = {
  // Button Sizes
  button: {
    sm: {
      height: '2rem',      // 32px
      padding: '0.5rem',   // 8px
      fontSize: '0.875rem', // 14px
    },
    md: {
      height: '2.5rem',    // 40px
      padding: '0.75rem',  // 12px
      fontSize: '1rem',    // 16px
    },
    lg: {
      height: '3rem',      // 48px
      padding: '1rem',     // 16px
      fontSize: '1.125rem', // 18px
    },
  },
  
  // Input Sizes
  input: {
    sm: {
      height: '2rem',      // 32px
      padding: '0.5rem',   // 8px
      fontSize: '0.875rem', // 14px
    },
    md: {
      height: '2.5rem',    // 40px
      padding: '0.75rem',  // 12px
      fontSize: '1rem',    // 16px
    },
    lg: {
      height: '3rem',      // 48px
      padding: '1rem',     // 16px
      fontSize: '1.125rem', // 18px
    },
  },
  
  // Icon Sizes
  icon: {
    xs: '0.75rem',   // 12px
    sm: '1rem',      // 16px
    md: '1.25rem',   // 20px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },
} as const

// Layout Constants
export const layout = {
  // Header
  header: {
    height: '3.125rem', // 50px
    mobileHeight: '4rem', // 64px
  },
  
  // Sidebar
  sidebar: {
    width: '4rem', // 64px
    mobileWidth: '16rem', // 256px
  },
  
  // Bottom Dock
  dock: {
    height: '3.125rem', // 50px
    mobileHeight: '4rem', // 64px
  },
  
  // Content
  content: {
    maxWidth: '1200px',
    padding: '1rem',
    mobilePadding: '0.5rem',
  },
} as const

// Accessibility
export const accessibility = {
  // Focus
  focus: {
    outline: '2px solid',
    outlineOffset: '2px',
    ring: '0 0 0 2px rgba(0, 255, 255, 0.5)',
  },
  
  // Touch Targets
  touchTarget: {
    minSize: '2.75rem', // 44px - WCAG guideline
  },
  
  // Screen Reader
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  },
} as const

// Export all tokens
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  animation,
  sizes,
  layout,
  accessibility,
} as const

export type DesignTokens = typeof designTokens
