import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        a4: '794px',
      },
      colors: {
        cream: '#F5F0E8',
        sand: '#E8E2D8',
        warm: '#D4C4B0',
        espresso: '#3D2C29',
        mocha: '#5C4A47',
        oat: '#FAF8F5',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
