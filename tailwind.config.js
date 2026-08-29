/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#EFEAE1',
        ink: '#2B2A28',
        moss: {
          DEFAULT: '#4A6B4E',
          dark: '#38512C',
          light: '#DCE5D8',
        },
        amber: {
          DEFAULT: '#C97B3D',
          light: '#F3E1CC',
        },
        rust: '#B5502B',
        line: '#DAD3C5',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        xl2: '20px',
      },
    },
  },
  plugins: [],
}
