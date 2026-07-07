module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0F766E',      // Modern Academic primary
          secondary: '#14B8A6',    // Modern Academic secondary
          accent: '#F59E0B',       // Accent
          bg: '#F8FAFC',           // Background slate
          card: '#FFFFFF',
          dark: '#0f172a',
        },
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'premium': '0 10px 30px -10px rgba(15, 118, 110, 0.1), 0 1px 3px rgba(0, 0, 0, 0.02)',
      }
    }
  },
  plugins: []
};
