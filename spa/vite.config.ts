import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "spa",

  // make sure “process.env.NODE_ENV” and “process” are safe at runtime
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    // a tiny runtime shim just in case something reads process at run-time
    process: { env: { NODE_ENV: "production" } } as any,
    global: "window",
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
      // ✅ DO NOT externalize React – bundle everything into the IIFE
      external: [],
      output: {
        inlineDynamicImports: true,
        // keep your CSS name stable
        assetFileNames(assetInfo) {
          const n = assetInfo?.name || "";
          if (n.endsWith(".css") || n === "style.css") return "hesaa-homepage.css";
          return n;
        },
      },
    },
  },
});
