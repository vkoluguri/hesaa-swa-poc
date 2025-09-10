import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "spa",
  build: {
    outDir: "../assets/app",        // bundle lands in /assets/app
    emptyOutDir: true,
    lib: {
      entry: "src/main.tsx",
      name: "HESAAHome",
      fileName: () => "hesaa-homepage.iife.js",
      formats: ["iife"],            // single self-executing script
    },
    rollupOptions: {
      output: { inlineDynamicImports: true }
    }
  }
});
