/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      primary: 'Poppins, sans-serif',
    },
    fontSize: {
      xxs: ['12px', '16px'],
      sm: ['14px', '20px'],
      md: ['16px', '24px'],
      lg: ['18px', '26px'],
      xl: ['20px', '28px'],
      '2xl': ['24px', '32px'],
      '3xl': ['30px', '38px'],
      '4xl': ['36px', '44px'],
      '5xl': ['48px', '56px'],
      '6xl': ['64px', '72px'],
    },
    container: {
      padding: {
        DEFAULT: '1rem',
        lg: '5rem',
      },
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1440px',
    },
    extend: {},
  },
  plugins: [],
};
