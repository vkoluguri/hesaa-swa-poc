/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./spa/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#0e7236",
        brandDark: "#0c5d2c",
        nav: "#0b5e87",
        navDark: "#0a4e70",
      },
      boxShadow: { soft: "0 6px 20px rgba(0,0,0,.06)" },
      maxWidth: { site: "1200px" }
    }
  },
  plugins: []
};
