/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          100: '#1f1f1f',
          200: '#252525',
          300: '#2b2b2b',
          400: '#3f3f3f',
        },
        hyphae: {
          300: '#c084fc',
          400: '#a855f7',
          500: '#9333ea',
          600: '#7e22ce',
        },
        spore: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        fungal: {
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
        },
        primary: {
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
        },
        secondary: {
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
        },
        accent: {
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
        },
        success: {
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
        },
        warning: {
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
        },
        error: {
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};
