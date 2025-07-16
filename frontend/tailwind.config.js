// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,jsx,js}',
  ],
  safelist: [
    // Animation classes
    'animate-spin', 
    'animate-spin-slow',
    'animate-pulse-slow',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f1a',
        surface: '#131924',
        text: '#e0e6f0',
        muted: '#7a869a',
        primary: '#00f5d4',
        secondary: '#38bdf8',
        'accent-start': '#8aff80',
        'accent-end': '#38bdf8',
        success: '#32ff7e',
        error: '#ff4b5c',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-slow': 'pulse 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        glow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 6px #00f5d4)' },
          '50%': { filter: 'drop-shadow(0 0 18px #00f5d4)' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Menlo', 'monospace'],
      },
      borderRadius: {
        xl: '1rem',
        lg: '0.5rem',
      },
    },
  },
  plugins: [],
};
