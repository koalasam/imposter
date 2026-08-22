/**
 * Centralized design tokens. Every screen and component pulls its styling
 * from here rather than hard-coding colors/spacing/etc. inline, so the
 * app's look can be changed in one place.
 *
 * Visual direction: a dark, vibrant "secretive party game" aesthetic —
 * deep indigo/near-black backgrounds, a hot violet/magenta accent for
 * primary actions, and a warm coral/red reserved specifically for
 * imposter-related danger states.
 */

export const colors = {
  background: "#0F0B1E",
  backgroundAlt: "#171227",
  surface: "#1E1833",
  surfaceElevated: "#271F42",
  border: "#352C55",

  textPrimary: "#F5F2FF",
  textSecondary: "#B6ADD1",
  textMuted: "#8177A0",

  accent: "#8B5CF6",
  accentAlt: "#C084FC",
  accentSoft: "rgba(139, 92, 246, 0.18)",

  danger: "#FB5B6E",
  dangerSoft: "rgba(251, 91, 110, 0.16)",

  success: "#34D399",
  warning: "#FBBF24",

  overlay: "rgba(6, 4, 16, 0.72)",
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const typography = {
  display: {
    fontSize: 40,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    letterSpacing: -0.3,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  label: {
    fontSize: 13,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
} as const;

export const shadows = {
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  button: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  subtle: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;

export const durations = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

export const theme = { colors, spacing, radii, typography, shadows, durations };
export type Theme = typeof theme;
