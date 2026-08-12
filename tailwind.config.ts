import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#DBEAFE',
        },
        secondary: '#4F46E5',
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F1F5F9',
        },
      },
      borderRadius: {
        DEFAULT: '16px',
        sm: '10px',
        lg: '20px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(15, 23, 42, 0.04)',
        md: '0 4px 16px rgba(15, 23, 42, 0.06)',
        lg: '0 12px 32px rgba(15, 23, 42, 0.10)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
      },
    },
  },
} satisfies Config