/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
    darkMode: 'class',
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6BAEC9",
        secondary: "var(--secondary)",
        tertiary: "var(--tertiary)",
        accent: "var(--accent)",
        fondo: "#F8F8F5",
        fondogris:"#f3f4f6",
        neutral: "#ffffff",
        darkNavBg: "#3b3b3b",
        darkNavText: "#f5f5f5",
        primaryHover: "#A8D7E6",
        terciary: "#DDC9A3",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        base: "4px",
      },
    },
  },
  plugins: [
plugin(function({ matchUtilities, theme }) {
      
      // Utilidad para el GROSOR del borde (ej: text-stroke-2)
      matchUtilities(
        {
          'text-stroke': (value) => ({
            '-webkit-text-stroke-width': value,
          }),
        },
        { values: theme('borderWidth') }
      )

      // Utilidad para el COLOR del borde (ej: text-stroke-red-500)
      matchUtilities(
        {
          'text-stroke': (value) => ({
            '-webkit-text-stroke-color': value,
          }),
        },
        { values: theme('colors') }
      )
    }),

  ],
};
