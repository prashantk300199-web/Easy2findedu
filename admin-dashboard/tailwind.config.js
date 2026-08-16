/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: '#070C18',
          900: '#050912',
          800: '#070C18',
          700: '#0C1424',
          600: '#141F35',
          500: '#1E2C47',
          400: '#2E3F5E',
          300: '#4A5C7C',
        },
        gold: {
          DEFAULT: '#C9A96A',
          700: '#9C7F45',
          600: '#B39055',
          500: '#C9A96A',
          400: '#D9C08E',
          300: '#E6D3AF',
          200: '#F0E4CC',
          100: '#F8F1E4',
        },
        cream: {
          DEFAULT: '#FBF8F2',
          50: '#FEFDFB',
          100: '#FBF8F2',
          200: '#F4EEE3',
          300: '#E9E0D0',
          400: '#D8CBB4',
        },
        ink: {
          DEFAULT: '#161310',
          900: '#161310',
          700: '#3B342B',
          500: '#6A6055',
          400: '#8E8375',
          300: '#B4A996',
        },
        wine: '#7A2E3B',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        overline: '0.3em',
        wide2: '0.16em',
      },
    },
  },
  plugins: [],
}
