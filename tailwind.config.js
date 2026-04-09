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
          DEFAULT: '#FF6000',
          hover: '#E55500',
        },
        brand: {
          bg: '#0D0D0D',
          orange: '#FF6000',
          white: '#FFFFFF',
        }
      }
    },
  },
  plugins: [],
}
