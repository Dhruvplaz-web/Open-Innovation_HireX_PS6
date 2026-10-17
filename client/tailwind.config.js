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
          100: '#f0f4fd',
          200: '#e9ebf2',
          300: '#d7dbe6',
          900: '#0f1117',
          950: '#0b0f19'
        },
        card: {
          light: '#ffffff',
          dark: '#131929'
        },
        brand: {
          black: '#0f172a',
          indigo: '#6366f1',
          blue: '#2563eb',
          sky: '#0284c7',
          cyan: '#06b6d4',
          purple: '#7c3aed',
          pink: '#f472b6',
          peach: '#fb923c',
          emerald: '#10b981'
        }
      },
      borderRadius: {
        'card': '20px',
        'subcard': '14px',
        'pill': '9999px'
      },
      boxShadow: {
        'soft': '0 8px 24px -4px rgba(100, 116, 139, 0.06)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 12px 40px -4px rgba(37, 99, 235, 0.12)',
        'elevated': '0 20px 45px -10px rgba(0, 0, 0, 0.08)'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
