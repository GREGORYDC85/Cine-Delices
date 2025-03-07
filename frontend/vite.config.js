import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080, // Vérifie que le port est bien 3000
    open: true, // Ouvre automatiquement dans le navigateur
  },
  base: "/", // Assure que la base est bien définie
});
