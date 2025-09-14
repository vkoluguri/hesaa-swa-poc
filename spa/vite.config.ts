import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function assetFileNames(assetInfo: any) {
  const name = assetInfo?.name || "";
  if (name.endsWith(".css") || name === "style.css") return "hesaa-homepage.css";
  return name;
}

export default defineConfig({
  root: "spa",
  plugins: [react()],
  define: {
    // prevent “process is not defined” and enable prod branches
    "process.env": {},
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    target: "es2019",
    outDir: "../assets/app",
    emptyOutDir: true,
    cssCodeSplit: true,
    assetsDir: ".",

    // ⬇️ IMPORTANT: build as a normal app, not lib mode
    rollupOptions: {
      input: "spa/src/main.tsx",
      external: [],             // do not externalize anything
      output: {
        format: "iife",
        inlineDynamicImports: true,
        entryFileNames: "hesaa-homepage.iife.js",
        assetFileNames,
      },
    },
  },
});
