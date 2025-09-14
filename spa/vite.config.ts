import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** keep css name stable */
function assetFileNames(assetInfo: any) {
  const name = assetInfo?.name || "";
  if (name.endsWith(".css") || name === "style.css") return "hesaa-homepage.css";
  return name;
}

export default defineConfig({
  plugins: [react()],
  root: "spa",
  define: {
    // avoid “process is not defined” in prod
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
      // ✅ tell Rollup/Vite “React is provided by the page”
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM"
        },
        inlineDynamicImports: true,
        assetFileNames
      }
    }
  }
});
