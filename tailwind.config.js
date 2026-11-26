/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5f2',
          100: '#ffe8e1',
          400: '#ff7b54',
          500: '#ff5722',
          600: '#ea4a16',
          glow: '#ff5e3a',
        },
        surface: {
          base: '#0c0f14',
          sidebar: '#12161f',
          card: '#181d27',
          cardHover: '#1f2533',
          pill: '#1e2430',
          border: 'rgba(255, 255, 255, 0.08)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-coral': '0 0 25px -4px rgba(255, 94, 58, 0.45)',
        'glow-coral-lg': '0 10px 40px -5px rgba(255, 94, 58, 0.55)',
        'glow-sm': '0 4px 14px -2px rgba(255, 94, 58, 0.35)',
        'floating-player': '0 12px 36px rgba(0, 0, 0, 0.65), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
      },
    },
  },
  plugins: [],
};
