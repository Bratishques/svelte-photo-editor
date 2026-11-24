import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// A relative base keeps the build working both at the domain root
// and under a sub-path such as https://<user>.github.io/svelte-photo-editor/.
export default defineConfig({
  base: "./",
  plugins: [svelte()],
  build: {
    // face-api.js (~660 kB) is split into its own chunk and loaded only
    // when the user runs face detection, so the warning is not useful here.
    chunkSizeWarningLimit: 700,
  },
});
