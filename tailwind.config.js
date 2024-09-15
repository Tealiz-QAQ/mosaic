// tailwind.config.js
import { nextui } from '@nextui-org/react'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // ...
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{html,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        GreekFreak: ['"Greek Freak"', 'sans-serif'],
        // Add more custom font families as needed
      },
    },
    screens: {
      '2xl': { max: '1535px' },
      // => @media (max-width: 1535px) { ... }

      xl: { max: '1279px' },
      // => @media (max-width: 1279px) { ... }

      lg: { max: '1023px' },
      // => @media (max-width: 1023px) { ... }

      md: { max: '767px' },
      // => @media (max-width: 767px) { ... }

      sm: { max: '639px' },
      // => @media (max-width: 639px) { ... }
    },
  },
  darkMode: 'class',
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            dark0: '#252831',
            background: '#161c20',
            primary: '#FACA20',
            black2: '#2D2F37',
            black3: '#42444B',
            black4: '#8B8D91',
            light2: '#8B8D91',
            ffffff10: 'rgba(255,255,255,0.1)',
            ffffff30: 'rgba(255,255,255,0.3)',
            ffffff70: 'rgba(255,255,255,0.7)',
            buttonRed: '#F44646',
            buttonYellow: '#FF9901',
            buttonGreen: '#18CF6A',
          },
        },
      },
    }),
  ],
}
