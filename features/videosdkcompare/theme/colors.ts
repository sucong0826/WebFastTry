// Unified color scheme configuration
export const colors = {
  // Primary colors - Modern blue palette
  primary: {
    main: "#2563EB", // Primary blue
    light: "#3B82F6", // Light blue
    dark: "#1D4ED8", // Dark blue
    contrast: "#FFFFFF", // Contrast color
  },

  // Secondary colors - Neutral gray palette
  secondary: {
    main: "#64748B", // Neutral gray
    light: "#94A3B8", // Light gray
    dark: "#475569", // Dark gray
    contrast: "#FFFFFF",
  },

  // Background colors
  background: {
    default: "#F8FAFC", // Main background
    paper: "#FFFFFF", // Card background
    dark: "#1E293B", // Dark background
    overlay: "rgba(0, 0, 0, 0.5)", // Overlay mask
  },

  // Text colors
  text: {
    primary: "#1E293B", // Primary text
    secondary: "#64748B", // Secondary text
    disabled: "#94A3B8", // Disabled text
    inverse: "#FFFFFF", // Inverse text
  },

  // Status colors
  success: {
    main: "#10B981", // Success green
    light: "#34D399", // Light green
    dark: "#059669", // Dark green
  },

  error: {
    main: "#EF4444", // Error red
    light: "#F87171", // Light red
    dark: "#DC2626", // Dark red
  },

  warning: {
    main: "#F59E0B", // Warning orange
    light: "#FBBF24", // Light orange
    dark: "#D97706", // Dark orange
  },

  info: {
    main: "#3B82F6", // Info blue
    light: "#60A5FA", // Light blue
    dark: "#2563EB", // Dark blue
  },

  // Video status colors
  video: {
    enabled: "#10B981", // Video enabled
    disabled: "#EF4444", // Video disabled
  },

  // Network quality colors
  network: {
    excellent: "#10B981", // Excellent
    good: "#F59E0B", // Good
    poor: "#EF4444", // Poor
  },

  // Border and divider colors
  border: {
    light: "#E2E8F0", // Light border
    medium: "#CBD5E1", // Medium border
    dark: "#94A3B8", // Dark border
  },

  // Shadow colors
  shadow: {
    light: "0 1px 3px rgba(0, 0, 0, 0.1)",
    medium: "0 4px 6px rgba(0, 0, 0, 0.1)",
    heavy: "0 10px 15px rgba(0, 0, 0, 0.1)",
  },
};

// Export color constants for component usage
export const {
  primary,
  secondary,
  background,
  text,
  success,
  error,
  warning,
  info,
  video,
  network,
  border,
  shadow,
} = colors;
