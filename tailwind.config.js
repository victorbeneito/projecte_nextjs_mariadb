/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6BAEC9",
        secondary: "#4A4A4A",
        terciary: "#DDC9A3",
        accent: "#F7A38B",
        neutral: "#FFFFFF",
        primaryHover: "#A8D7E6",
        fondo: "#F8F8F5",
        darkBg: "#6e6e6e",
        darkNavBg: "#ababab",
        darkNavText: "#2C2C2C",
        hoverFooter: "#d6d2d2",
        botonHover: "#c9c6c6",
        fondoCasilla: "#f2fbff"
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        orienta: ["Orienta", "sans-serif"],
      },
      boxShadow: {
        base: "0 2px 8px 0 rgba(28,37,44,0.1)",
      },
      borderRadius: {
        base: "12px",
      },
    },
  },
  plugins: [],
};
