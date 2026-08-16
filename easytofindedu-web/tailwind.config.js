/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep midnight navy — the canvas for every cinematic moment.
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
        // Champagne gold — prestige without glare. Never pure yellow.
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
      fontSize: {
        d1: ['clamp(3rem, 8.4vw, 8.5rem)', { lineHeight: '0.94', letterSpacing: '-0.025em' }],
        d2: ['clamp(2.4rem, 5.4vw, 5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        d3: ['clamp(1.9rem, 3.6vw, 3.1rem)', { lineHeight: '1.08', letterSpacing: '-0.015em' }],
        d4: ['clamp(1.4rem, 2.2vw, 1.9rem)', { lineHeight: '1.18', letterSpacing: '-0.01em' }],
      },
      letterSpacing: {
        overline: '0.3em',
        wide2: '0.16em',
      },
      maxWidth: {
        page: '1480px',
        prose2: '68ch',
      },
      boxShadow: {
        lift: '0 24px 60px -24px rgba(7, 12, 24, 0.35)',
        liftLg: '0 40px 90px -30px rgba(7, 12, 24, 0.45)',
        goldGlow: '0 0 0 1px rgba(201, 169, 106, 0.35), 0 20px 50px -20px rgba(201, 169, 106, 0.25)',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
        swift: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: { 700: '700ms', 900: '900ms', 1200: '1200ms', 1600: '1600ms' },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scrollHint: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '40%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee 48s linear infinite',
        shimmer: 'shimmer 7s linear infinite',
        floatY: 'floatY 7s ease-in-out infinite',
        scrollHint: 'scrollHint 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
