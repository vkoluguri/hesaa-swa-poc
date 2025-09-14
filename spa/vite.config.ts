import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function assetFileNames(assetInfo: any) {
  const name = assetInfo?.name || "";
  if (name.endsWith(".css") || name === "style.css") return "hesaa-homepage.css";
  return name;
}

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client"],
  },
  ssr: {
    noExternal: ["react", "react-dom", "react-dom/client", "react/jsx-runtime"],
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
      // Inline everything (no externals)
      external: () => false,
      output: {
        inlineDynamicImports: true,
        assetFileNames,
        globals: {},
      },
      treeshake: true,   // ✅ moved here
    },
  },
});
