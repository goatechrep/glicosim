/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './App.tsx',
    './index.tsx',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'primary': '0 10px 30px -5px rgb(249 115 22 / 0.3)',
        'success': '0 10px 30px -5px rgb(16 185 129 / 0.3)',
        'error': '0 10px 30px -5px rgb(239 68 68 / 0.3)',
      },
    },
  },
  plugins: [],
};
