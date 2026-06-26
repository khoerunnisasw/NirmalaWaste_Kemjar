/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          600: '#059669', // Emerald Green (Tema Ekologi)
          700: '#047857',
        },
        slate: {
          50: '#f8fafc',
          300: '#cbd5e1',
          600: '#475569', // Slate Grey (Teks Utama)
        }
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}