/**
 * Theme configuration
 * Design tokens for consistent styling across the app
 */

import {Platform} from 'react-native';

// VIBGYOR color scheme for post age
export const ageBucketColors = {
  VIOLET: '#8B00FF',
  INDIGO: '#4B0082',
  BLUE: '#0000FF',
  GREEN: '#00FF00',
  YELLOW: '#FFFF00',
  ORANGE: '#FF7F00',
  RED: '#FF0000',
};

// Main color palette
export const colors = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0051D5',
  primaryLight: '#4DA2FF',

  // Secondary colors
  secondary: '#5AC8FA',
  secondaryDark: '#32AEE8',
  secondaryLight: '#88D9FB',

  // Neutral colors
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9F9F9',

  // Text colors
  textPrimary: '#000000',
  textSecondary: '#3C3C43',
  textTertiary: '#8E8E93',
  textDisabled: '#C7C7CC',

  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5AC8FA',

  // Badge colors
  badgeVerified: '#34C759',
  badgePropertyVerified: '#007AFF',
  badgeBoth: '#AF52DE',

  // Border colors
  border: '#C6C6C8',
  borderLight: '#E5E5EA',

  // Age bucket colors (VIBGYOR)
  ...ageBucketColors,
};

// Typography
export const typography = {
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 40,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
};

// Spacing scale (8px base)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

// Border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Shadow styles
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Layout constants
export const layout = {
  screenPadding: spacing.md,
  maxContentWidth: 600,
  headerHeight: 56,
  bottomTabHeight: 64,
  fabSize: 56,
};

// Animation durations
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Z-index levels
export const zIndex = {
  base: 0,
  dropdown: 1000,
  modal: 2000,
  toast: 3000,
  tooltip: 4000,
};

// Export theme object
const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  animation,
  zIndex,
};

export type Theme = typeof theme;

export default theme;
