/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trello: {
          blue: '#0079BF',
          green: '#61BD4F',
          orange: '#FF9F1A',
          red: '#EB5A46',
          purple: '#C377E0',
          pink: '#FF78CB',
          sky: '#00C2E0',
          lime: '#51E898',
          dark: '#1D2125',
          darker: '#161A1D',
        }
      }
    },
  },
  plugins: [],
}

