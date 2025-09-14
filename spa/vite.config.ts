// spa/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
    "process.env": {} as any
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
      formats: ["iife"]
    },
    rollupOptions: {
      // 👇 tell the IIFE to use global React/ReactDOM that we load from CDN
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        inlineDynamicImports: true,
        assetFileNames,
      }
    }
  }
});
