/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brewery: {
          50: '#fbf8f3',
          100: '#f5edd9',
          200: '#ecd9b3',
          300: '#dfbe83',
          400: '#d19f55',
          500: '#b87d31',
          600: '#9b6225',
          700: '#7d4a1f',
          800: '#643c1c',
          900: '#52321a',
          950: '#2e190d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
