/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        'mytheme': {
          "primary": "#1d4ed8",

          "secondary": "#afc1ed",

          "accent": "#f98ecd",

          "neutral": "#1E1424",

          "base-100": "#f3f4f6",

          "info": "#5CADEB",

          "success": "#17AB5E",

          "warning": "#EDCD2C",

          "error": "#F64C73",
        },
      },
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
    ],
  },
  // eslint-disable-next-line no-undef
  plugins: [require('daisyui')],
}
