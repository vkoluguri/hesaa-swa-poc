import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// optional: keep the same asset name for CSS
function assetFileNames(assetInfo: any) {
  const name = assetInfo?.name || "";
  if (name.endsWith(".css") || name === "style.css") return "hesaa-homepage.css";
  return name;
}

export default defineConfig({
  plugins: [react()],
  root: "spa",

  // make sure Vite/Rollup don't externalize react*
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  ssr: { noExternal: ["react", "react-dom"] },

  // shim process.* at compile time
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    // leaving this empty object prevents other 'process.env.X' lookups from exploding
    "process.env": {},
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
        assetFileNames,
        // CRITICAL: do NOT externalize anything
        globals: {},
      },
      // make sure nothing is marked external
      external: () => false,
    },
  },
});
