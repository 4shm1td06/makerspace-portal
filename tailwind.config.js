/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enables dark mode via class
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Scan JS/TS/TSX/JSX in src
  ],
  theme: {
    extend: {
      transformOrigin: {
        'center': 'center',
      },
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          DEFAULT: '#dc2626', // red-600
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};

