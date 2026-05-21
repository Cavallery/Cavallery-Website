/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "line-shadow": "line-shadow 15s linear infinite",
      },
      keyframes: {
        "line-shadow": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "100% -100%" },
        },
      },
    },
  },
  plugins: [],
}
