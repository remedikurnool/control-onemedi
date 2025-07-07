
export const healthcareTheme = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Main primary
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Main success
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Main warning
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Main error
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    medical: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  }
};

export const statusColors = {
  pending: 'bg-warning-100 text-warning-800 border-warning-200',
  confirmed: 'bg-primary-100 text-primary-800 border-primary-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  delivered: 'bg-success-100 text-success-800 border-success-200',
  cancelled: 'bg-error-100 text-error-800 border-error-200',
  completed: 'bg-success-100 text-success-800 border-success-200',
  active: 'bg-success-100 text-success-800 border-success-200',
  inactive: 'bg-medical-100 text-medical-800 border-medical-200',
  draft: 'bg-medical-100 text-medical-600 border-medical-200',
  published: 'bg-success-100 text-success-800 border-success-200',
};

export const getStatusColor = (status: string): string => {
  return statusColors[status as keyof typeof statusColors] || statusColors.pending;
};
