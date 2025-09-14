import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build a single IIFE bundle we can load from /assets/app in index.html.
// We do NOT externalize React — it's bundled to avoid any CDN/CORS/order issues.
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
        // keep original asset filenames; our CSS is linked from index.html
      },
    },
  },
});
