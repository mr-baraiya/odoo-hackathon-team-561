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
          DEFAULT: '#2D6B8F',
          hover: '#245673',
          light: '#F0F7FA',
        },
        secondary: {
          DEFAULT: '#5A6B7C',
          hover: '#475564',
        },
        bgmain: '#F7F8FA',
        surface: '#FFFFFF',
        textmain: '#1A1D23',
        textsub: '#5A6B7C',
        textmuted: '#94A3B8',
        accent: {
          DEFAULT: '#2D6B8F',
          hover: '#245673',
          light: '#F0F7FA',
        },
        bordercolor: '#E8ECF1',
        hoverbg: '#F7F8FA',
        success: {
          DEFAULT: '#2E7D5E',
          light: '#F0FDF4',
        },
        warning: {
          DEFAULT: '#B8860B',
          light: '#FEFCE8',
        },
        danger: {
          DEFAULT: '#D32F2F',
          light: '#FEF2F2',
        },
        info: {
          DEFAULT: '#0284C7',
          light: '#F0F9FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        modal: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
