import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 📌 Définit un port stable pour Vite
export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.VITE_FRONTEND_PORT) || 5173,
  },
});
