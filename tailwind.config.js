/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        army: {
          50: '#f4f6f0',
          100: '#e5ebd9',
          200: '#cad7b4',
          300: '#aabd88',
          400: '#8ca362',
          500: '#6f8745',
          600: '#566b34',
          700: '#43532b',
          800: '#384325',
          900: '#2f3821',
          950: '#181e10',
        }
      }
    },
  },
  plugins: [],
}
