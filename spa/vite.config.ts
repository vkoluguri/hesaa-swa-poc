import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "spa",
  plugins: [
    react({
      jsxRuntime: "classic",
    }),
  ],
  define: {
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
      // VERY IMPORTANT: DO NOT externalize react or react-dom
      external: [],              // <— keep this line
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
