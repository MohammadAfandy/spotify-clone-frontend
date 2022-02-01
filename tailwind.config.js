// tailwind.config.js
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontSize: {
        'xxs': '.6rem',
      },
      spacing: {
        '105': '27rem',
      },
      colors: {
        'light-black': '#181818',
        'light-black-1': '#262626',
        'light-black-2': '#3E3E3E',
      },
      backgroundImage: theme => ({
        'banner-gradient': 'linear-gradient(90deg, #af2896, #509bf5)',
      }),
      inset: {
        '1/12': '8.333333%',
      },
      keyframes: {
        slide: {
          '0%': { transform: 'translateX(-13rem)' },
          '100%': { transform: 'translateY(0)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        slide: 'slide 400ms ease-in-out',
        marquee: 'marquee 10s linear infinite',
      },
      zIndex: {
        '-1': '-1',
      },
      screens: {
        'canhover': {'raw': '(hover: hover)'},
      },
    },
  },
  variants: {
    extend: {
      display: ['group-hover'],
      brightness: ['hover'],
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};
