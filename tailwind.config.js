/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#fafafa',
        line: '#e7e7e9',
        ink: {
          50: '#f6f6f7',
          100: '#eeeef0',
          200: '#d8d8dc',
          300: '#b4b4ba',
          400: '#838388',
          500: '#5e5e63',
          600: '#46464a',
          700: '#34343a',
          800: '#1f1f24',
          900: '#121216',
          950: '#08080a',
        },
        accent: {
          50: '#eff5ff',
          100: '#dbe7ff',
          200: '#bfd5ff',
          300: '#92b8ff',
          400: '#5e92fc',
          500: '#3b6df5',
          600: '#264fe6',
          700: '#1d4ed8',
          800: '#1e3fa8',
          900: '#1e3784',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)',
        lifted: '0 10px 28px -10px rgba(16,24,40,.15)',
      },
    },
  },
  plugins: [],
}
