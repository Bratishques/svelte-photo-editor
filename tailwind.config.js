const production = !process.env.ROLLUP_WATCH; // or some other env var like NODE_ENV
module.exports = {
  theme: {
    extend: {
        cursor: {
            ne: "ne-resize",
            nw: "nw-resize",
            nesw: "nesw-resize",
            nwse: "nwse-resize"
        }
    }
  },
  future: { // for tailwind 2.0 compat
    purgeLayersByDefault: true, 
    removeDeprecatedGapUtilities: true,
  },
  plugins: [
    // for tailwind UI users only
    require('@tailwindcss/ui'),
    // other plugins here
  ],
  purge: {
    enabled: !process.env.ROLLUP_WATCH,
    mode: 'all',
    content: ['./**/**/*.html', './**/**/*.svelte'],

    options: {
      whitelistPatterns: [/svelte-/],
      defaultExtractor: (content) =>
        [...content.matchAll(/(?:class:)*([\w\d-/:%.]+)/gm)].map(([_match, group, ..._rest]) => group),
    },
  },
};