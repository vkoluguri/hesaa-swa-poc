import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build a single IIFE bundle we can load from /assets/app in index.html.
// React is bundled (no externals) to avoid any CDN/CORS/order issues.
export default defineConfig({
  plugins: [react()],
  root: "spa",
  define: {
    // guard against rare "process is not defined" at runtime in an IIFE
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
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
      },
    },
  },
});
