import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0a0a0a',
          secondary: '#141414',
          tertiary: '#1a1a1a',
        },
        accent: {
          primary: '#6366f1',
          secondary: '#818cf8',
        },
      },
    },
  },
  plugins: [],
}
export default config
