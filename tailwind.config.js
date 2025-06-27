/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}' // Next.js pages
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Gidugu', 'sans-serif']
      },
      colors: {
        primary: 'oklch(44.6% 0.1584 291.12)',
      },
    }
  },
  plugins: []
};
