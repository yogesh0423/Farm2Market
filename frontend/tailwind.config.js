/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farmGreen: {
          50: '#f2f9f1',
          100: '#e1f3e0',
          500: '#2e7d32',
          600: '#256728',
          700: '#1b5e20',
        },
      },
    },
  },
  plugins: [],
}