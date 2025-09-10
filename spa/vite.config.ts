import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "spa",
  define: {
    // React and some libs expect process.env.* to exist.
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": {} as any
  },
  build: {
    target: "es2019",
    outDir: "../assets/app",
    emptyOutDir: true,
    lib: {
      entry: "src/main.tsx",
      name: "HESAAHome",
      fileName: () => "hesaa-homepage.iife.js",
      formats: ["iife"]
    },
    rollupOptions: {
      output: { inlineDynamicImports: true }
    }
  }
});
