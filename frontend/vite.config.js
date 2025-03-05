import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuration de Vite
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Assure-toi que ce port est bien configuré
    open: true, // Ouvre automatiquement dans le navigateur à chaque démarrage
  },
  base: "./", // Important pour les chemins relatifs si tu déploies plus tard
});
