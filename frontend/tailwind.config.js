/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#07080C',
        surface: '#0F1117',
        elevated: {
          DEFAULT: '#161922',
          2: '#1C2030',
        },
        'border-subtle': '#20242E',
        'border-strong': '#2A2F3D',
        'text-primary': '#ECEEF2',
        'text-secondary': '#8A93A6',
        'text-tertiary': '#565E70',
        accent: {
          DEFAULT: '#F39200',
          bright: '#FFA940',
          deep: '#C66700',
          soft: 'rgba(243, 146, 0, 0.08)',
          glow: 'rgba(243, 146, 0, 0.45)',
        },
        brand: {
          green: '#4FB04F',
          'green-soft': 'rgba(79, 176, 79, 0.12)',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-orange': '0 0 24px rgba(243, 146, 0, 0.45)',
        'glow-orange-lg': '0 0 40px rgba(243, 146, 0, 0.4), 0 8px 24px -8px rgba(243, 146, 0, 0.5)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease backwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}