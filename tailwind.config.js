/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{svelte,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      cursor: {
        ne: "ne-resize",
        nw: "nw-resize",
        nesw: "nesw-resize",
        nwse: "nwse-resize",
      },
    },
  },
  plugins: [],
};
