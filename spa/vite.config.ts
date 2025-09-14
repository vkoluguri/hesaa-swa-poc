// spa/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// keep your helper if you like; trimmed for clarity
function assetFileNames(assetInfo: any) {
  const name = assetInfo?.name || "";
  if (name.endsWith(".css") || name === "style.css") return "hesaa-homepage.css";
  return name;
}

export default defineConfig({
  root: "spa",
  plugins: [react()],
  define: {
    // make sure nothing crashes looking for Node env
    "process.env": {},
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  optimizeDeps: {
    // make Vite prebundle these so they are inlined later
    include: ["react", "react-dom", "react-dom/client"],
  },
  // NOT using build.lib (which tends to externalize). Use rollupOptions + format: "iife".
  build: {
    target: "es2019",
    outDir: "../assets/app",
    emptyOutDir: true,
    cssCodeSplit: true,
    assetsDir: ".",
    rollupOptions: {
      // absolutely no externals — bundle everything
      external: () => false,
      input: "spa/src/main.tsx",
      output: {
        format: "iife",
        name: "HESAAHome",
        entryFileNames: "hesaa-homepage.iife.js",
        inlineDynamicImports: true,
        assetFileNames,
        globals: {}, // none
      },
      treeshake: true,
    },
  },
});
