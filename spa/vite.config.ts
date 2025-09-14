import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build a single IIFE bundle we can load from /assets/app in index.html.
// React + ReactDOM are bundled inside (no CDN).
export default defineConfig({
  plugins: [react()],
  root: "spa",
  build: {
    target: "es2019",
    outDir: "../assets/app",
    emptyOutDir: true,
    cssCodeSplit: true,
    assetsDir: ".",
    lib: {
      entry: "src/main.tsx",
      name: "HESAAHome",
      fileName: () => "hesaa-homepage.iife.js",
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        intro: `;(function (w) {
          w.process = w.process || { env: { NODE_ENV: "production" } };
          w.global = w.global || w;
        })(window);`,
      },
    },
  },
});
