import { Platform } from 'react-native';

// App Design Colors from Behance Design
export const AppColors = {
  // Primary accent blue
  accent: '#AACAEF',
  // Dark background
  background: '#27292A',
  // Pure white
  white: '#FFFFFF',
  // Darker card background
  cardBackground: '#1E2021',
  // Even darker surface
  surface: '#1A1B1C',
  // Border/divider color
  border: '#3A3C3D',
  // Muted text
  textMuted: '#8E9196',
  // Secondary text
  textSecondary: '#B0B3B8',
  // Success green
  success: '#4CAF50',
  // Error/urgent red
  error: '#FF5252',
  // Warning/medium orange
  warning: '#FFA726',
  // Low priority blue
  lowPriority: '#AACAEF',
  // Input background
  inputBackground: '#2D2F30',
  // Overlay
  overlay: 'rgba(0,0,0,0.5)',
  // Tab bar background
  tabBar: '#1A1B1C',
  // Floating button gradient
  floatingButtonStart: '#AACAEF',
  floatingButtonEnd: '#7BA4D4',
  // AI gradient
  aiGradientStart: '#1a237e',
  aiGradientMid: '#283593',
  aiGradientEnd: '#3949ab',
};

export const Colors = {
  light: {
    text: '#FFFFFF',
    background: '#27292A',
    tint: '#AACAEF',
    icon: '#8E9196',
    tabIconDefault: '#8E9196',
    tabIconSelected: '#AACAEF',
  },
  dark: {
    text: '#FFFFFF',
    background: '#27292A',
    tint: '#AACAEF',
    icon: '#8E9196',
    tabIconDefault: '#8E9196',
    tabIconSelected: '#AACAEF',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};
