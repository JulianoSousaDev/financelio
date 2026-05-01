// Design tokens extracted from DESIGN.md
// All spacing values in pixels (4px base unit)

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  screenPadding: 16,
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  display: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 1.15,
    letterSpacing: -0.02,
  },
  h1: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 1.25,
    letterSpacing: -0.01,
  },
  h2: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 1.3,
    letterSpacing: 0,
  },
  h3: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 1.35,
    letterSpacing: 0,
  },
  body: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  bodyBold: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 1.4,
    letterSpacing: 0,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 1.3,
    letterSpacing: 0.02,
    textTransform: 'uppercase' as const,
  },
  monetaryValue: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 1.15,
    letterSpacing: -0.02,
    fontVariant: ['tabular-nums'] as const,
  },
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  fab: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

// Color palettes for light and dark themes
export const lightColors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  success: '#10B981',
  successBackground: '#ECFDF5',
  danger: '#EF4444',
  dangerBackground: '#FEF2F2',
  warning: '#F59E0B',
  warningBackground: '#FFFBEB',
  text: '#111827',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  border: '#E5E7EB',
  borderFocused: '#2563EB',
  overlay: 'rgba(0,0,0,0.5)',
  income: '#059669',
  expense: '#DC2626',
} as const;

export const darkColors = {
  background: '#0B0D13',
  surface: '#151821',
  surfaceSecondary: '#1E2130',
  primary: '#3B82F6',
  primaryHover: '#60A5FA',
  success: '#34D399',
  successBackground: '#0F2F21',
  danger: '#F87171',
  dangerBackground: '#3B1515',
  warning: '#FBBF24',
  warningBackground: '#3B2F15',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textDisabled: '#64748B',
  border: '#2A2D3A',
  borderFocused: '#3B82F6',
  overlay: 'rgba(0,0,0,0.7)',
  income: '#34D399',
  expense: '#F87171',
} as const;

export type ThemeColors = typeof lightColors | typeof darkColors;
