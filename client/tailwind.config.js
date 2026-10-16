/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        porcelain: {
          50: '#f8f9fc',
          100: '#f3f4f8',
          200: '#e9ebf2',
          300: '#d7dbe6',
          900: '#0f1117',
          950: '#090a0f'
        },
        card: {
          light: '#ffffff',
          dark: '#1a1d27'
        },
        brand: {
          black: '#111111',
          indigo: '#818cf8',
          pink: '#f472b6',
          peach: '#fb923c',
          sky: '#38bdf8',
          emerald: '#10b981'
        }
      },
      borderRadius: {
        'card': '28px',
        'pill': '9999px'
      },
      boxShadow: {
        'soft': '0 14px 34px -6px rgba(0, 0, 0, 0.04), 0 2px 10px -2px rgba(0, 0, 0, 0.02)',
        'elevated': '0 20px 45px -10px rgba(0, 0, 0, 0.08)'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
