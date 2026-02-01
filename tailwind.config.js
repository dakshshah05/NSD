/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        energy: {
          olive: '#AEB877',
          lime: '#D8E983',
          cream: '#FFFBB1',
          sage: '#A5C89E',
        }
      },
    },
  },
  plugins: [],
};
