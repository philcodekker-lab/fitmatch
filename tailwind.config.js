/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F5F2EA',
        surface: '#FFFFFF',
        surface2: '#FBF8F0',
        ink: {
          900: '#16140F',
          700: '#3D3A33',
          500: '#6E6A60',
          400: '#92897A',
          300: '#B8AE9E',
        },
        line: '#E5DFD0',
        line2: '#EEE9DB',
        brand: {
          50: '#ECF1E8',
          100: '#DCE9DF',
          500: '#23745A',
          600: '#1A5640',
          700: '#13402F',
          900: '#0B2B1F',
        },
        lime: '#D7F23A',
        'lime-dark': '#B5CE16',
        warn: '#C0664A',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Geist', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        card: '22px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,18,12,0.04), 0 1px 1px rgba(20,18,12,0.03)',
        lift: '0 10px 30px -12px rgba(20,18,12,0.18), 0 4px 8px -4px rgba(20,18,12,0.08)',
      },
      letterSpacing: {
        'mono-meta': '0.08em',
      },
    },
  },
  plugins: [],
};
