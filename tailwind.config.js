/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // App Router対応のパス
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5", // indigo-600 相当
      },
      fontFamily: {
        sans: ["Noto Sans JP", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
