import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins' :['Poppins', 'sans-serif']
       },
      backgroundImage: {
        "app-bg":"url('/svg/app-bg.svg')",
        "onboarding-bg":"url('/svg/onboarding-bg.svg')",
        "wallet-bg":"url('/svg/wallet-bg.svg')",
      },
    },
    screens: {
      'xxs':'320px',
      
      'xsm':'450px',

      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
  },
  plugins: [],
}
export default config
