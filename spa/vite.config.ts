import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "spa",
  plugins: [
    react({
      // use classic so we don't need react/jsx-runtime as a global
      jsxRuntime: "classic",
    }),
  ],
  define: {
    // prevent "process is not defined" when React or libs check env
    "process.env.NODE_ENV": JSON.stringify("production"),
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
      // ❌ DO NOT externalize react / react-dom – bundle everything
      external: [],
      output: {
        inlineDynamicImports: true,
        assetFileNames(assetInfo) {
          const n = assetInfo?.name || "";
          if (n.endsWith(".css") || n === "style.css") return "hesaa-homepage.css";
          return n;
        },
      },
    },
  },
});
