/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f0f0f',
        paper: '#fafaf7',
        signal: '#ff3b00',
        mint: '#c8f5e0',
        peach: '#ffd6c0',
        lavender: '#ddd6fe',
        butter: '#fef08a',
        // dark mode
        dark: {
          bg: '#0a0a0a',
          card: '#141412',
          card2: '#1e1e1b',
          border: '#333330',
          text: '#e8e8e3',
          muted: '#888884',
        }
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
