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
          DEFAULT: '#1a1a2e',
          hover: '#121223'
        },
        secondary: {
          DEFAULT: '#2d3436',
          hover: '#212529'
        },
        bgmain: '#f8f9fa',
        surface: '#ffffff',
        textmain: '#1a1a2e',
        textsub: '#636e72',
        accent: {
          DEFAULT: '#00b894',
          hover: '#00a383',
          light: '#e6f7f4'
        },
        bordercolor: '#e9ecef',
        hoverbg: '#f1f3f5'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
