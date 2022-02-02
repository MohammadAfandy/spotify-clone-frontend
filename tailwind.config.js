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
        '5%': '5%',
        '10%': '10%',
        '15%': '15%',
        '20%': '20%',
        '25%': '25%',
        '30%': '30%',
        '35%': '35%',
        '40%': '40%',
        '45%': '45%',
        '50%': '50%',
        '55%': '55%',
        '60%': '60%',
        '65%': '65%',
        '70%': '70%',
        '75%': '75%',
        '80%': '80%',
        '85%': '85%',
        '90%': '90%',
        '95%': '95%',
        '100%': '100%',
      },
      colors: {
        'light-black': '#181818',
        'light-black-1': '#262626',
        'light-black-2': '#3E3E3E',

        // ''
        // 'base-color': '#121212';
      },
      backgroundImage: theme => ({
        'background-gradient': 'linear-gradient(rgba(0, 0, 0, .85) 0 , #121212 100%)',
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
