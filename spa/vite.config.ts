import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// keep css name stable
function assetFileNames(assetInfo: any) {
  const name = assetInfo?.name || "";
  if (name.endsWith(".css") || name === "style.css") return "hesaa-homepage.css";
  return name;
}

export default defineConfig({
  plugins: [react()],
  root: "spa",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": {} as any,
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
      // IMPORTANT: tell Rollup these come from window.*
      external: ["react", "react-dom", "react-dom/client"],
      output: {
        inlineDynamicImports: true,
        assetFileNames,
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-dom/client": "ReactDOM", // createRoot lives here, same global
        },
      },
    },
  },
});
