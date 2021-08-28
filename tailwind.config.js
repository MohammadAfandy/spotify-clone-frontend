// tailwind.config.js
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
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
