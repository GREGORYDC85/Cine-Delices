import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    port: parseInt(process.env.VITE_FRONTEND_PORT || "5173"), // ✅ Correction : chaîne de caractères par défaut
    proxy: {
      "/api": {
        target:
          process.env.NODE_ENV === "production"
            ? process.env.VITE_API_URL
            : "http://localhost:10000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""), // ✅ Optionnel : retire "/api" du chemin ciblé
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
