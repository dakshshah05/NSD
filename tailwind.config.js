/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: 'rgb(var(--bg-main) / <alpha-value>)',
          900: 'rgb(var(--bg-card) / <alpha-value>)',
          800: 'rgb(var(--bg-input) / <alpha-value>)',
          700: 'rgb(var(--border) / <alpha-value>)', 
          600: 'rgb(var(--border) / <alpha-value>)', // Map 600 to border for safety
          500: 'rgb(var(--text-muted) / <alpha-value>)',
          400: 'rgb(var(--text-muted) / <alpha-value>)',
          300: 'rgb(var(--text-sec) / <alpha-value>)', // 300 is often secondary text
          200: 'rgb(var(--text-sec) / <alpha-value>)',
          100: 'rgb(var(--text-main) / <alpha-value>)', // 100 near white
          50: 'rgb(var(--text-main) / <alpha-value>)', 
        },
        white: 'rgb(var(--text-main) / <alpha-value>)', // White becomes Dark Text in light mode
        emerald: {
          400: 'rgb(var(--accent) / <alpha-value>)',
          500: 'rgb(var(--accent-dark) / <alpha-value>)',
        },
        // Keep original palette available as 'energy' just in case
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
