/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        brand: {
          red: '#ED1C24',
          'red-dark': '#D11419',
          'red-light': '#F63440',
          blue: '#0066cc',
          'blue-dark': '#0052a3',
          'blue-light': '#3399ff',
          orange: '#ff6600',
          yellow: '#ffc107',
        },
      },
      backgroundImage: {
        'gradient-red': 'linear-gradient(135deg, #ED1C24 0%, #F63440 50%, #ED1C24 100%)',
        'gradient-red-dark': 'linear-gradient(90deg, #D11419 0%, #C00510 100%)',
        'gradient-blue': 'linear-gradient(135deg, #0066cc 0%, #3399ff 100%)',
        'gradient-purple': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #667eea 0%, #00d4ff 100%)',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl-colored': '0 20px 25px -5px rgba(227, 6, 19, 0.1), 0 10px 10px -5px rgba(227, 6, 19, 0.04)',
      },
    },
  },
  plugins: [],
}
