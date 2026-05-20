// src/theme/index.ts
import { DefaultTheme, MD3DarkTheme } from 'react-native-paper';
import { Dimensions } from 'react-native';

// Screen dimensions
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Spacing system (8-point grid)
export const spacing = {
  xs: 4,
  s: 8, 
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

// Modern color palette
const colors = {
  // Primary colors
  primary: '#4361EE',        // Vibrant blue
  primaryLight: '#738AFF',
  primaryDark: '#2541DF',
  
  // Secondary colors
  secondary: '#FF5E5B',      // Coral/salmon accent
  secondaryLight: '#FF8C89',
  secondaryDark: '#DD302D',
  
  // Neutral colors
  black: '#111827',
  dark: '#1F2937',
  medium: '#6B7280',
  light: '#E5E7EB',
  white: '#FFFFFF',
  
  // Semantic colors
  success: '#10B981',        // Green
  warning: '#FBBF24',        // Yellow
  error: '#EF4444',          // Red
  info: '#3B82F6',           // Blue
  
  // Gradients (as standalone colors for components that don't support gradients)
  gradientStart: '#4361EE',
  gradientEnd: '#3A0CA3',
  
  // Background colors
  backgroundLight: '#F9FAFB',
  backgroundDark: '#111827',
  cardLight: '#FFFFFF',
  cardDark: '#1F2937',
};

// Border radius
export const borderRadius = {
  s: 4,
  m: 8,
  l: 12,
  xl: 16,
  xxl: 24,
  round: 999,
};

// Shadows
export const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Light theme
export const lightTheme = {
  ...DefaultTheme,
  roundness: 8,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.backgroundLight,
    surface: colors.cardLight,
    text: colors.black,
    placeholder: colors.medium,
    disabled: colors.light,
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    onBackground: colors.black,
    onSurface: colors.black,
  },
};

// Dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  roundness: 8,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight,
    accent: colors.secondaryLight,
    background: colors.backgroundDark,
    surface: colors.cardDark,
    text: colors.white,
    placeholder: colors.medium,
    disabled: colors.dark,
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    onBackground: colors.white,
    onSurface: colors.white,
  },
};

// Typography
export const typography = {
  fontSizes: {
    xs: 12,
    s: 14,
    m: 16,
    l: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
  },
};

// Animation durations
export const animation = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Export the combined theme
export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  animation,
};